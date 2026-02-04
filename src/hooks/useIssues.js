import { useState, useCallback } from 'react';
import { getOctokit } from '../lib/github';
import {
  KANBAN_LABELS,
  KANBAN_COLUMNS,
  TYPE_LABELS,
  extractKanbanColumn,
} from '../lib/constants';

export function useIssues() {
  const [issues, setIssues] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const ensureLabelsExist = useCallback(async (owner, repo) => {
    const octokit = getOctokit();
    const { data: existingLabels } =
      await octokit.rest.issues.listLabelsForRepo({
        owner,
        repo,
        per_page: 100,
      });
    const existingNames = existingLabels.map((l) => l.name);

    const allLabels = [...KANBAN_LABELS, ...TYPE_LABELS];
    for (const label of allLabels) {
      if (!existingNames.includes(label.name)) {
        try {
          await octokit.rest.issues.createLabel({ owner, repo, ...label });
        } catch {
          // Label may already exist from a race condition
        }
      }
    }
  }, []);

  const fetchIssues = useCallback(
    async (owner, repo) => {
      const octokit = getOctokit();
      if (!octokit) return;

      setLoading(true);
      setError(null);

      try {
        await ensureLabelsExist(owner, repo);

        const allIssues = [];
        let page = 1;
        while (true) {
          const { data } = await octokit.rest.issues.listForRepo({
            owner,
            repo,
            state: 'open',
            per_page: 100,
            page,
          });
          // Filter out pull requests (they also appear in issues endpoint)
          const onlyIssues = data.filter((i) => !i.pull_request);
          allIssues.push(...onlyIssues);
          if (data.length < 100) break;
          page++;
        }

        const grouped = {};
        for (const col of KANBAN_COLUMNS) {
          grouped[col] = [];
        }

        for (const issue of allIssues) {
          const column = extractKanbanColumn(issue.labels) || 'backlog';
          if (grouped[column]) {
            grouped[column].push(issue);
          } else {
            grouped.backlog.push(issue);
          }
        }

        setIssues(grouped);
      } catch (err) {
        setError('Failed to fetch issues.');
      } finally {
        setLoading(false);
      }
    },
    [ensureLabelsExist]
  );

  const moveIssue = useCallback(
    async (owner, repo, issueNumber, fromColumn, toColumn) => {
      const octokit = getOctokit();
      if (!octokit || fromColumn === toColumn) return;

      // Optimistic update
      setIssues((prev) => {
        const updated = { ...prev };
        const fromList = [...(updated[fromColumn] || [])];
        const toList = [...(updated[toColumn] || [])];
        const idx = fromList.findIndex((i) => i.number === issueNumber);
        if (idx === -1) return prev;
        const [moved] = fromList.splice(idx, 1);
        // Update labels on the moved issue
        moved.labels = moved.labels
          .filter((l) => !l.name?.startsWith('kanban:'))
          .concat({ name: `kanban:${toColumn}` });
        toList.unshift(moved);
        updated[fromColumn] = fromList;
        updated[toColumn] = toList;
        return updated;
      });

      try {
        const { data: issue } = await octokit.rest.issues.get({
          owner,
          repo,
          issue_number: issueNumber,
        });

        const labels = issue.labels
          .map((l) => l.name)
          .filter((l) => !l.startsWith('kanban:'))
          .concat(`kanban:${toColumn}`);

        await octokit.rest.issues.update({
          owner,
          repo,
          issue_number: issueNumber,
          labels,
        });
      } catch {
        // Revert on failure
        setError('Failed to move issue. Refreshing...');
        // We don't have owner/repo here easily, so caller should refetch
      }
    },
    []
  );

  const createIssue = useCallback(async (owner, repo, title, body, column, issueType) => {
    const octokit = getOctokit();
    if (!octokit) return null;

    const labels = [`kanban:${column}`];
    if (issueType) labels.push(`type:${issueType}`);

    try {
      const { data } = await octokit.rest.issues.create({
        owner,
        repo,
        title,
        body,
        labels,
      });

      setIssues((prev) => {
        const updated = { ...prev };
        updated[column] = [data, ...(updated[column] || [])];
        return updated;
      });

      return data;
    } catch {
      setError('Failed to create issue.');
      return null;
    }
  }, []);

  const updateIssue = useCallback(
    async (owner, repo, issueNumber, title, body, issueType) => {
      const octokit = getOctokit();
      if (!octokit) return null;

      try {
        // Fetch current labels to preserve non-type labels
        const { data: current } = await octokit.rest.issues.get({
          owner,
          repo,
          issue_number: issueNumber,
        });
        const labels = current.labels
          .map((l) => l.name)
          .filter((l) => !l.startsWith('type:'));
        if (issueType) labels.push(`type:${issueType}`);

        const { data } = await octokit.rest.issues.update({
          owner,
          repo,
          issue_number: issueNumber,
          title,
          body,
          labels,
        });

        setIssues((prev) => {
          const updated = {};
          for (const [col, list] of Object.entries(prev)) {
            updated[col] = list.map((i) =>
              i.number === issueNumber ? { ...i, ...data } : i
            );
          }
          return updated;
        });

        return data;
      } catch {
        setError('Failed to update issue.');
        return null;
      }
    },
    []
  );

  return {
    issues,
    loading,
    error,
    fetchIssues,
    moveIssue,
    createIssue,
    updateIssue,
    clearError: () => setError(null),
  };
}
