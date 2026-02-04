export const STORAGE_KEY = 'gh_kanban_token';
export const REPO_STORAGE_KEY = 'gh_kanban_repo';

export const KANBAN_COLUMNS = ['backlog', 'todo', 'doing', 'done'];

export const KANBAN_LABELS = [
  { name: 'kanban:backlog', color: '6B7280', description: 'Backlog' },
  { name: 'kanban:todo', color: '3B82F6', description: 'To Do' },
  { name: 'kanban:doing', color: 'F59E0B', description: 'In Progress' },
  { name: 'kanban:done', color: '10B981', description: 'Done' },
];

export const COLUMN_TITLES = {
  backlog: 'Backlog',
  todo: 'To Do',
  doing: 'In Progress',
  done: 'Done',
};

export const COLUMN_COLORS = {
  backlog: 'bg-gray-100 border-gray-300',
  todo: 'bg-blue-50 border-blue-300',
  doing: 'bg-amber-50 border-amber-300',
  done: 'bg-green-50 border-green-300',
};

export const COLUMN_HEADER_COLORS = {
  backlog: 'bg-gray-500',
  todo: 'bg-blue-500',
  doing: 'bg-amber-500',
  done: 'bg-green-500',
};

export const TYPE_LABELS = [
  { name: 'type:epic', color: '7C3AED', description: 'Epic' },
  { name: 'type:feature', color: '2563EB', description: 'Feature' },
  { name: 'type:task', color: '6B7280', description: 'Task' },
  { name: 'type:bug', color: 'DC2626', description: 'Bug' },
];

export const TYPE_KEYS = ['epic', 'feature', 'task', 'bug'];

export const TYPE_CONFIG = {
  epic: { label: 'Epic', color: '#7C3AED', bg: '#7C3AED20', border: '#7C3AED40' },
  feature: { label: 'Feature', color: '#2563EB', bg: '#2563EB20', border: '#2563EB40' },
  task: { label: 'Task', color: '#6B7280', bg: '#6B728020', border: '#6B728040' },
  bug: { label: 'Bug', color: '#DC2626', bg: '#DC262620', border: '#DC262640' },
};

export function extractIssueType(labels) {
  const typeLabel = labels.find((l) => {
    const name = typeof l === 'string' ? l : l.name;
    return name?.startsWith('type:');
  });
  if (!typeLabel) return null;
  const name = typeof typeLabel === 'string' ? typeLabel : typeLabel.name;
  return name.replace('type:', '');
}

export function extractKanbanColumn(labels) {
  const kanbanLabel = labels.find((l) => {
    const name = typeof l === 'string' ? l : l.name;
    return name?.startsWith('kanban:');
  });
  if (!kanbanLabel) return null;
  const name = typeof kanbanLabel === 'string' ? kanbanLabel : kanbanLabel.name;
  return name.replace('kanban:', '');
}
