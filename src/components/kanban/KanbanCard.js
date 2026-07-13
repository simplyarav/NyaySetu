"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { formatDistanceToNow } from "date-fns";

import TextScramble from "@/components/ui/TextScramble";

import { useReducedMotion } from "@/hooks/useReducedMotion";

export default function KanbanCard({ caseItem, onClick, isIllegalDrag }) {
  const prefersReducedMotion = useReducedMotion();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: caseItem._id, data: { status: caseItem.status } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    WebkitTransform: "translateZ(0)",
    isolation: "isolate"
  };

  const sealRef = useRef(null);
  const [justStamped, setJustStamped] = useState(false);

  // Trigger seal animation when status updates
  const prevStatusRef = useRef(caseItem.status);
  useEffect(() => {
    if (prevStatusRef.current && prevStatusRef.current !== caseItem.status) {
      setJustStamped(true);
      const el = sealRef.current;
      if (el) {
        if (prefersReducedMotion) {
          gsap.set(el, { autoAlpha: 1, scale: 1, rotation: 0 });
          setTimeout(() => {
            gsap.set(el, { autoAlpha: 0 });
            setJustStamped(false);
          }, 1500);
        } else {
          gsap.fromTo(el, 
            { scale: 1.4, rotation: -8, autoAlpha: 0 },
            { scale: 1, rotation: 0, autoAlpha: 1, duration: 0.4, ease: "back.out(1.7)" }
          );
          setTimeout(() => {
            gsap.to(el, { autoAlpha: 0, duration: 0.5 });
            setTimeout(() => setJustStamped(false), 500);
          }, 2500);
        }
      }
    }
    prevStatusRef.current = caseItem.status;
  }, [caseItem.status, prefersReducedMotion]);

  const getBadgeColor = (score) => {
    if (score < 30) return "bg-sage text-paper";
    if (score < 70) return "bg-verdict-gold text-ink";
    return "bg-seal-crimson text-paper";
  };

  const ageStr = caseItem.lastActionDate 
    ? formatDistanceToNow(new Date(caseItem.lastActionDate)) 
    : "Just now";

  // If prefers reduced motion, disable the spring animation on illegal drag
  const illegalDragAnimation = prefersReducedMotion 
    ? (isIllegalDrag ? { opacity: [1, 0.5, 1] } : {}) 
    : (isIllegalDrag ? { x: [-10, 10, -10, 10, 0] } : {});

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      animate={illegalDragAnimation}
      transition={prefersReducedMotion ? { duration: 0.2 } : { type: "spring", stiffness: 300, damping: 10 }}
      className={`relative bg-paper border border-ink/20 p-4 mb-3 cursor-grab active:cursor-grabbing group focus-visible:ring-2 focus-visible:ring-seal-crimson focus-visible:ring-offset-2 outline-none interactive hover:-translate-y-[2px] hover:border-verdict-gold transition-all duration-200 ${isDragging ? "opacity-50 z-50" : ""}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (!isDragging) onClick(caseItem);
        }
      }}
    >
      {/* Click overlay for mouse users, keeps the drag handle distinct */}
      <div className="absolute inset-0 z-0" onClick={() => { if (!isDragging) onClick(caseItem) }} />

      <div 
        {...attributes} 
        {...listeners}
        className="absolute top-2 right-2 p-1 text-slate opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:text-ink focus-visible:opacity-100 outline-none"
        aria-label="Drag Handle"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
      </div>

      <div className="relative z-10 pointer-events-none">
        <TextScramble text={caseItem.caseNumber} className="font-mono text-xs text-slate mb-1 block" />
        <h3 className="font-display font-semibold text-ink leading-tight mb-3 pr-6">
          {caseItem.title}
        </h3>
        
        <div className="flex justify-between items-end">
          <div className="flex flex-col space-y-1">
            <div className="text-xs text-slate font-sans">
              <span className="font-medium text-ink">{caseItem.litigantIds?.length || 0}</span> Litigant(s)
            </div>
            <div className="text-xs text-slate font-sans">
              Action: {ageStr} ago
            </div>
          </div>
          
          <div className={`font-mono text-[10px] uppercase tracking-wider px-2 py-1 ${getBadgeColor(caseItem.pendencyScore || 0)}`}>
            Score: {Math.round(caseItem.pendencyScore || 0)}
          </div>
        </div>
      </div>

      {/* Brutalist Stamp Graphic */}
      <div 
        ref={sealRef} 
        className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-0 z-20"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(140,28,19,0.15)_0%,transparent_60%)]"></div>
        <div className="w-32 h-16 border-4 border-seal-crimson flex items-center justify-center relative mix-blend-multiply bg-paper/80 backdrop-blur-sm">
          <span className="text-seal-crimson font-mono font-bold text-lg tracking-widest uppercase rotate-[-5deg]">
            STAMPED
          </span>
        </div>
      </div>
    </motion.div>
  );
}
