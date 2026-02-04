import { useState } from 'react';

export default function TokenEntry({ onConnect, error, loading }) {
  const [token, setToken] = useState('');
  const [remember, setRemember] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (token.trim()) {
      onConnect(token.trim(), remember);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Connect to GitHub
        </h1>

        <form onSubmit={handleSubmit}>
          <label
            htmlFor="token"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Personal Access Token
          </label>
          <input
            id="token"
            type="password"
            autoComplete="off"
            data-lpignore="true"
            data-1p-ignore=""
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
          />

          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}

          <label className="flex items-center mt-4 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="mr-2 rounded border-gray-300"
            />
            Remember token (stored in browser localStorage)
          </label>

          <button
            type="submit"
            disabled={!token.trim() || loading}
            className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Connecting...' : 'Connect'}
          </button>
        </form>

        <hr className="my-6 border-gray-200" />

        <div className="text-sm text-gray-600 space-y-2">
          <p className="font-medium">Need a token?</p>
          <ol className="list-decimal list-inside space-y-1 text-gray-500">
            <li>Go to GitHub Settings &rarr; Developer settings</li>
            <li>Personal access tokens &rarr; Tokens (classic)</li>
            <li>
              Generate new token with <code className="bg-gray-100 px-1 rounded">repo</code> scope
            </li>
          </ol>
          <a
            href="https://github.com/settings/tokens/new"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 text-blue-600 hover:text-blue-800 underline"
          >
            Create token on GitHub &nearr;
          </a>
        </div>
      </div>
    </div>
  );
}
