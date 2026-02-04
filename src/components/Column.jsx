import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import Card from './Card';
import { COLUMN_TITLES, COLUMN_COLORS, COLUMN_HEADER_COLORS } from '../lib/constants';

export default function Column({ id, issues, onAddCard, onCardClick }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      className={`flex flex-col rounded-lg border-2 min-w-[280px] w-[280px] ${COLUMN_COLORS[id]} ${
        isOver ? 'ring-2 ring-blue-400' : ''
      }`}
    >
      <div
        className={`flex items-center justify-between px-3 py-2 rounded-t-md ${COLUMN_HEADER_COLORS[id]}`}
      >
        <h3 className="text-sm font-bold text-white uppercase tracking-wide">
          {COLUMN_TITLES[id]}
        </h3>
        <span className="text-xs text-white/80 bg-white/20 rounded-full px-2 py-0.5">
          {issues.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[200px]"
      >
        <SortableContext
          items={issues.map((i) => `issue-${i.number}`)}
          strategy={verticalListSortingStrategy}
        >
          {issues.map((issue) => (
            <Card
              key={issue.number}
              issue={issue}
              onClick={onCardClick}
            />
          ))}
        </SortableContext>

        {issues.length === 0 && (
          <div className="text-xs text-gray-400 text-center py-8">
            No issues
          </div>
        )}
      </div>

      <button
        onClick={() => onAddCard(id)}
        className="m-2 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-white/60 rounded-md transition-colors border border-dashed border-gray-300"
      >
        + Add card
      </button>
    </div>
  );
}
