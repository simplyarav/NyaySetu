"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import KanbanCard from "./KanbanCard";

export default function KanbanColumn({ id, title, cases, onCardClick, illegalDragId }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="font-display font-semibold text-lg text-ink">{title}</h2>
        <span className="font-mono text-xs bg-ink/10 text-ink px-2 py-1">
          {cases.length}
        </span>
      </div>

      <div 
        ref={setNodeRef}
        className={`flex-1 min-h-[500px] p-2 transition-colors duration-200 border-2 ${isOver ? "bg-ink/5 border-dashed border-ink/20" : "bg-transparent border-transparent"}`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        <SortableContext items={cases.map(c => c._id)} strategy={verticalListSortingStrategy}>
          {cases.length === 0 && !isOver && (
            <div className="h-32 col-span-full border-2 border-dashed border-ink/10 flex items-center justify-center text-slate font-mono text-sm">
              No Cases
            </div>
          )}
          {cases.map((c) => (
            <KanbanCard 
              key={c._id} 
              caseItem={c} 
              onClick={onCardClick}
              isIllegalDrag={illegalDragId === c._id}
            />
          ))}
        </SortableContext>
        </div>
      </div>
    </div>
  );
}
