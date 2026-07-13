import { Suspense } from "react";
import KanbanBoard from "@/components/kanban/KanbanBoard";

export default function StaffDashboard() {
  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden">
      <div className="p-8 border-b border-ink/20 shrink-0">
        <h1 className="text-3xl font-display font-bold text-ink tracking-tight mb-2">Staff Workspace</h1>
        <p className="text-slate font-mono text-xs uppercase tracking-widest">Active Cases & Board Management</p>
      </div>
      <Suspense fallback={<div className="p-8 font-mono text-slate">Loading board...</div>}>
        <KanbanBoard />
      </Suspense>
    </div>
  );
}
