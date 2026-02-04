import { useState, useMemo } from 'react';

export default function RepoSelector({ repos, loading, onSelect }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return repos;
    const q = search.toLowerCase();
    return repos.filter((r) => r.full_name.toLowerCase().includes(q));
  }, [repos, search]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading repositories...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-md p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Select a Repository
        </h2>

        <input
          type="text"
          placeholder="Search repositories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm mb-4"
        />

        <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md divide-y divide-gray-100">
          {filtered.length === 0 ? (
            <div className="p-4 text-sm text-gray-500 text-center">
              No repositories found.
            </div>
          ) : (
            filtered.map((repo) => (
              <button
                key={repo.id}
                onClick={() => onSelect(repo)}
                className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors"
              >
                <div className="font-medium text-gray-900 text-sm">
                  {repo.full_name}
                </div>
                {repo.description && (
                  <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                    {repo.description}
                  </div>
                )}
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  {repo.language && <span>{repo.language}</span>}
                  <span>{repo.private ? 'Private' : 'Public'}</span>
                  <span>
                    {repo.open_issues_count} issue
                    {repo.open_issues_count !== 1 ? 's' : ''}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
