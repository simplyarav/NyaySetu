import { useDroppable } from "@dnd-kit/core";

export default function KanbanSidebarItem({ id, title, count, isActive, onClick }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <button
      ref={setNodeRef}
      onClick={onClick}
      className={`w-full text-left p-4 border transition-all flex items-center justify-between ${
        isActive 
          ? "border-ink bg-ink text-paper scale-[1.02] shadow-md z-10 relative" 
          : "border-ink/20 bg-paper/50 hover:border-ink/50 text-ink"
      } ${isOver && !isActive ? "bg-ink/5 border-dashed border-ink/50" : ""}`}
    >
      <span className="font-display font-semibold">{title}</span>
      <span className={`font-mono text-xs px-2 py-1 ${isActive ? "bg-paper/20" : "bg-ink/10"}`}>
        {count}
      </span>
    </button>
  );
}
