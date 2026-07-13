"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import KanbanSidebarItem from "./KanbanSidebarItem";
import KanbanColumn from "./KanbanColumn";
import CaseDetailModal from "./CaseDetailModal";
import gsap from "gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useRef } from "react";
import NyayaIcon from "@/components/ui/NyayaIcon";
import NyayaLoader from "@/components/ui/NyayaLoader";

const COLUMNS = [
  { id: "filed", title: "Filed" },
  { id: "admitted", title: "Admitted" },
  { id: "hearing_scheduled", title: "Hearing Scheduled" },
  { id: "adjourned", title: "Adjourned" },
  { id: "evidence", title: "Evidence" },
  { id: "judgment_reserved", title: "Judgment Rsvd" },
  { id: "closed", title: "Closed" },
];

export default function KanbanBoard() {
  const searchParams = useSearchParams();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [illegalDragId, setIllegalDragId] = useState(null);
  const [toast, setToast] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const boardRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    fetchCases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const caseId = searchParams.get("caseId");
    if (caseId) {
      // Just set selectedCase to a partial object with _id, 
      // CaseDetailModal fetches the full detail anyway
      setSelectedCase({ _id: caseId });
    }
  }, [searchParams]);

  const fetchCases = async () => {
    try {
      const res = await fetch("/api/cases");
      const data = await res.json();
      if (res.ok) setCases(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      
      // Animate columns in after load
      if (!prefersReducedMotion) {
        setTimeout(() => {
          const columns = boardRef.current?.querySelectorAll(".kanban-col-anim");
          if (columns) {
            gsap.fromTo(columns, 
              { opacity: 0, y: 50 }, 
              { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" }
            );
          }
        }, 100);
      }
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id; // Either a card id or a column id

    const activeCase = cases.find(c => c._id === activeId);
    if (!activeCase) return;

    // Find target column
    let targetStatus = overId;
    const overCase = cases.find(c => c._id === overId);
    if (overCase) {
      targetStatus = overCase.status;
    }

    if (activeCase.status === targetStatus) {
      // Just reordering in same column - normally handled by arrayMove
      // Skipping reorder persistence for simplicity
      return;
    }

    // Call API to attempt transition
    try {
      const res = await fetch(`/api/cases/${activeId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          newStatus: targetStatus,
          reason: targetStatus === "adjourned" ? "Kanban drag" : "" 
        })
      });

      const data = await res.json();

      if (!res.ok) {
        // Illegal transition
        showToast(`Illegal Transition: ${data.error}`);
        setIllegalDragId(activeId);
        setTimeout(() => setIllegalDragId(null), 1000);
        return;
      }

      // Success, update local state to trigger GSAP in the card
      setCases(cases.map(c => c._id === activeId ? { ...c, status: targetStatus } : c));
    } catch (err) {
      console.error(err);
      showToast("Network error trying to transition state.");
    }
  };

  const [activeSection, setActiveSection] = useState(COLUMNS[0].id);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[500px]">
        <NyayaLoader text="Loading workspace..." />
      </div>
    );
  }

  const activeColumn = COLUMNS.find(c => c.id === activeSection);
  const activeCases = cases.filter(c => c.status === activeSection);

  return (
    <div ref={boardRef} className="flex-1 flex flex-col md:flex-row relative min-h-[calc(100vh-100px)]">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-seal-crimson text-paper px-6 py-3 font-mono text-sm border-2 border-seal-crimson z-50 animate-in slide-in-from-top-5">
          {toast}
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        {/* Sidebar */}
        <div className="w-full md:w-1/4 border-r border-ink/20 bg-paper/50 h-full overflow-y-auto p-4 space-y-2 kanban-col-anim opacity-0" style={prefersReducedMotion ? {opacity: 1} : {}}>
          <div className="font-mono text-xs uppercase tracking-widest text-slate mb-4 px-2">Workflows</div>
          {COLUMNS.map((col) => (
            <KanbanSidebarItem
              key={col.id}
              id={col.id}
              title={col.title}
              count={cases.filter(c => c.status === col.id).length}
              isActive={activeSection === col.id}
              onClick={() => setActiveSection(col.id)}
            />
          ))}
        </div>

        {/* Main Area */}
        <div className="w-full md:w-3/4 p-4 md:p-8 overflow-y-auto h-full kanban-col-anim opacity-0" style={prefersReducedMotion ? {opacity: 1} : {}}>
          <KanbanColumn
            id={activeColumn.id}
            title={activeColumn.title}
            cases={activeCases}
            onCardClick={(c) => setSelectedCase(c)}
            illegalDragId={illegalDragId}
          />
        </div>
      </DndContext>

      {selectedCase && (
        <CaseDetailModal 
          caseId={selectedCase._id} 
          onClose={() => setSelectedCase(null)} 
          onUpdated={fetchCases}
        />
      )}
    </div>
  );
}
