import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRepos } from '../hooks/useRepos';
import { useIssues } from '../hooks/useIssues';
import { REPO_STORAGE_KEY } from '../lib/constants';
import TokenEntry from './TokenEntry';
import RepoSelector from './RepoSelector';
import Board from './Board';

export default function App() {
  const {
    user,
    loading: authLoading,
    error: authError,
    isAuthenticated,
    setToken,
    logout,
  } = useAuth();

  const { repos, loading: reposLoading } = useRepos(isAuthenticated);

  const {
    issues,
    loading: issuesLoading,
    error: issuesError,
    fetchIssues,
    moveIssue,
    createIssue,
    updateIssue,
    clearError,
  } = useIssues();

  const [selectedRepo, setSelectedRepo] = useState(null);

  // Restore selected repo from storage
  useEffect(() => {
    if (!isAuthenticated) return;
    const stored = localStorage.getItem(REPO_STORAGE_KEY);
    if (stored) {
      try {
        setSelectedRepo(JSON.parse(stored));
      } catch {
        localStorage.removeItem(REPO_STORAGE_KEY);
      }
    }
  }, [isAuthenticated]);

  // Fetch issues when repo is selected
  useEffect(() => {
    if (selectedRepo && isAuthenticated) {
      fetchIssues(selectedRepo.owner, selectedRepo.repo);
    }
  }, [selectedRepo, isAuthenticated, fetchIssues]);

  const handleConnect = useCallback(
    async (token, remember) => {
      await setToken(token, remember);
    },
    [setToken]
  );

  const handleSelectRepo = useCallback((repo) => {
    const info = { owner: repo.owner.login, repo: repo.name };
    setSelectedRepo(info);
    localStorage.setItem(REPO_STORAGE_KEY, JSON.stringify(info));
  }, []);

  const handleChangeRepo = useCallback(() => {
    setSelectedRepo(null);
    localStorage.removeItem(REPO_STORAGE_KEY);
  }, []);

  const handleLogout = useCallback(() => {
    setSelectedRepo(null);
    localStorage.removeItem(REPO_STORAGE_KEY);
    logout();
  }, [logout]);

  const handleRefresh = useCallback(() => {
    if (selectedRepo) {
      clearError();
      fetchIssues(selectedRepo.owner, selectedRepo.repo);
    }
  }, [selectedRepo, fetchIssues, clearError]);

  const handleMove = useCallback(
    (issueNumber, from, to) => {
      if (selectedRepo) {
        moveIssue(selectedRepo.owner, selectedRepo.repo, issueNumber, from, to);
      }
    },
    [selectedRepo, moveIssue]
  );

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <TokenEntry
        onConnect={handleConnect}
        error={authError}
        loading={authLoading}
      />
    );
  }

  // No repo selected
  if (!selectedRepo) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header
          user={user}
          onLogout={handleLogout}
        />
        <RepoSelector
          repos={repos}
          loading={reposLoading}
          onSelect={handleSelectRepo}
        />
      </div>
    );
  }

  // Board view
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header
        user={user}
        repo={selectedRepo}
        onChangeRepo={handleChangeRepo}
        onLogout={handleLogout}
        onRefresh={handleRefresh}
      />
      <Board
        owner={selectedRepo.owner}
        repo={selectedRepo.repo}
        issues={issues}
        loading={issuesLoading}
        error={issuesError}
        onMove={handleMove}
        onCreate={createIssue}
        onUpdate={updateIssue}
        onRefresh={handleRefresh}
      />
      <footer className="px-4 py-2 text-xs text-gray-400 text-center border-t border-gray-200">
        Your token is stored in your browser only and sent directly to GitHub.
        For maximum security, use a fine-grained token with minimal permissions.
      </footer>
    </div>
  );
}

function Header({ user, repo, onChangeRepo, onLogout, onRefresh }) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold text-gray-900">GitHub Kanban</h1>
        {repo && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {repo.owner}/{repo.repo}
            </span>
            <button
              onClick={onChangeRepo}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Change
            </button>
            <button
              onClick={onRefresh}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Refresh
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-2">
            <img
              src={user.avatar_url}
              alt={user.login}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-sm text-gray-600">@{user.login}</span>
          </div>
        )}
        <button
          onClick={onLogout}
          className="text-sm text-red-600 hover:text-red-800 underline"
        >
          Disconnect
        </button>
      </div>
    </header>
  );
}
