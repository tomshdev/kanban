import { useState, useEffect } from 'react';
import { COLUMN_TITLES, KANBAN_COLUMNS } from '../lib/constants';

export default function IssueModal({
  issue,
  defaultColumn,
  onClose,
  onCreate,
  onUpdate,
}) {
  const isEditing = !!issue;
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [column, setColumn] = useState(defaultColumn || 'backlog');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (issue) {
      setTitle(issue.title);
      setBody(issue.body || '');
    }
  }, [issue]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    if (isEditing) {
      await onUpdate(issue.number, title.trim(), body.trim());
    } else {
      await onCreate(title.trim(), body.trim(), column);
    }
    setSaving(false);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">
            {isEditing ? `Edit Issue #${issue.number}` : 'New Issue'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Issue title"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Describe the issue (Markdown supported)"
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
            />
          </div>

          {!isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Column
              </label>
              <select
                value={column}
                onChange={(e) => setColumn(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                {KANBAN_COLUMNS.map((col) => (
                  <option key={col} value={col}>
                    {COLUMN_TITLES[col]}
                  </option>
                ))}
              </select>
            </div>
          )}

          {isEditing && issue.html_url && (
            <a
              href={issue.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm text-blue-600 hover:text-blue-800 underline"
            >
              View on GitHub &nearr;
            </a>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || saving}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving
                ? 'Saving...'
                : isEditing
                  ? 'Update Issue'
                  : 'Create Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
