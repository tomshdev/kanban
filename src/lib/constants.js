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

export function extractKanbanColumn(labels) {
  const kanbanLabel = labels.find((l) => {
    const name = typeof l === 'string' ? l : l.name;
    return name?.startsWith('kanban:');
  });
  if (!kanbanLabel) return null;
  const name = typeof kanbanLabel === 'string' ? kanbanLabel : kanbanLabel.name;
  return name.replace('kanban:', '');
}
