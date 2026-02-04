import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function Card({ issue, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `issue-${issue.number}`,
    data: { issue },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        // Don't open modal if user is dragging
        if (!isDragging) {
          onClick(issue);
        }
      }}
      className={`bg-white rounded-md border border-gray-200 p-3 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50 shadow-lg' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium text-gray-900 leading-snug">
          {issue.title}
        </span>
        <span className="text-xs text-gray-400 shrink-0">#{issue.number}</span>
      </div>

      {issue.labels && issue.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {issue.labels
            .filter((l) => !l.name?.startsWith('kanban:'))
            .map((label) => (
              <span
                key={label.id || label.name}
                className="inline-block px-1.5 py-0.5 text-xs rounded-full"
                style={{
                  backgroundColor: label.color
                    ? `#${label.color}20`
                    : '#e5e7eb',
                  color: label.color ? `#${label.color}` : '#6b7280',
                  border: label.color
                    ? `1px solid #${label.color}40`
                    : '1px solid #d1d5db',
                }}
              >
                {label.name}
              </span>
            ))}
        </div>
      )}

      {issue.assignees && issue.assignees.length > 0 && (
        <div className="flex items-center gap-1 mt-2">
          {issue.assignees.map((a) => (
            <img
              key={a.id}
              src={a.avatar_url}
              alt={a.login}
              title={a.login}
              className="w-5 h-5 rounded-full"
            />
          ))}
        </div>
      )}
    </div>
  );
}
