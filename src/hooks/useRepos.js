import { useState, useEffect, useCallback } from 'react';
import { getOctokit } from '../lib/github';

export function useRepos(isAuthenticated) {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRepos = useCallback(async () => {
    const octokit = getOctokit();
    if (!octokit) return;

    setLoading(true);
    setError(null);
    try {
      const allRepos = [];
      let page = 1;
      while (true) {
        const { data } = await octokit.rest.repos.listForAuthenticatedUser({
          per_page: 100,
          page,
          sort: 'updated',
          direction: 'desc',
        });
        allRepos.push(...data);
        if (data.length < 100) break;
        page++;
      }
      setRepos(allRepos);
    } catch (err) {
      setError('Failed to fetch repositories.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRepos();
    } else {
      setRepos([]);
    }
  }, [isAuthenticated, fetchRepos]);

  return { repos, loading, error, refetch: fetchRepos };
}
