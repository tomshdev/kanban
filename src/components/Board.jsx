import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import Column from './Column';
import Card from './Card';
import IssueModal from './IssueModal';
import { KANBAN_COLUMNS, extractKanbanColumn } from '../lib/constants';

export default function Board({
  owner,
  repo,
  issues,
  loading,
  error,
  onMove,
  onCreate,
  onUpdate,
  onRefresh,
}) {
  const [activeIssue, setActiveIssue] = useState(null);
  const [modalState, setModalState] = useState({
    open: false,
    issue: null,
    column: null,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  function findColumnForIssue(issueNumber) {
    for (const col of KANBAN_COLUMNS) {
      if (issues[col]?.some((i) => i.number === issueNumber)) {
        return col;
      }
    }
    return null;
  }

  function handleDragStart(event) {
    const { active } = event;
    const issueNumber = parseInt(active.id.replace('issue-', ''), 10);
    for (const col of KANBAN_COLUMNS) {
      const found = issues[col]?.find((i) => i.number === issueNumber);
      if (found) {
        setActiveIssue(found);
        break;
      }
    }
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveIssue(null);

    if (!over) return;

    const issueNumber = parseInt(active.id.replace('issue-', ''), 10);
    const fromColumn = findColumnForIssue(issueNumber);

    // Determine target column: either the droppable column ID
    // or the column of the issue being dropped onto
    let toColumn = null;
    if (KANBAN_COLUMNS.includes(over.id)) {
      toColumn = over.id;
    } else {
      // Dropped on another card - find its column
      const overNumber = parseInt(over.id.replace('issue-', ''), 10);
      toColumn = findColumnForIssue(overNumber);
    }

    if (fromColumn && toColumn && fromColumn !== toColumn) {
      onMove(issueNumber, fromColumn, toColumn);
    }
  }

  const handleCardClick = useCallback((issue) => {
    setModalState({ open: true, issue, column: null });
  }, []);

  const handleAddCard = useCallback((column) => {
    setModalState({ open: true, issue: null, column });
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalState({ open: false, issue: null, column: null });
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">Loading issues...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <div className="text-red-500">{error}</div>
        <button
          onClick={onRefresh}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 flex gap-4 p-4 overflow-x-auto">
          {KANBAN_COLUMNS.map((col) => (
            <Column
              key={col}
              id={col}
              issues={issues[col] || []}
              onAddCard={handleAddCard}
              onCardClick={handleCardClick}
            />
          ))}
        </div>

        <DragOverlay>
          {activeIssue ? (
            <div className="w-[264px]">
              <Card issue={activeIssue} onClick={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {modalState.open && (
        <IssueModal
          issue={modalState.issue}
          defaultColumn={modalState.column}
          onClose={handleCloseModal}
          onCreate={(title, body, column, issueType) =>
            onCreate(owner, repo, title, body, column, issueType)
          }
          onUpdate={(number, title, body, issueType) =>
            onUpdate(owner, repo, number, title, body, issueType)
          }
        />
      )}
    </>
  );
}
