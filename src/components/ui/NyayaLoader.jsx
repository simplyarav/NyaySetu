"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export default function NyayaLoader({ fullScreen = false, text = "Loading records..." }) {
  const containerRef = useRef(null);
  const scalesRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion || !scalesRef.current) return;
    
    gsap.fromTo(scalesRef.current,
      { rotate: -15 },
      {
        rotate: 15,
        duration: 1.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        transformOrigin: "6px 10px"
      }
    );
  }, [prefersReducedMotion]);

  const wrapperClass = fullScreen 
    ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-paper/80 backdrop-blur-sm"
    : "w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-transparent";

  return (
    <div className={wrapperClass} ref={containerRef}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={100} 
        height={100} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth={1.2} 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="text-verdict-gold mb-6 opacity-80"
      >
        {/* Head */}
        <circle cx="12" cy="4" r="2" />
        {/* Robed Body */}
        <path d="M10 6 L6 22 H18 L14 6 Z" />
        {/* Right Arm & Sword */}
        <path d="M14 8 L18 11" />
        <path d="M17 11 H19" />
        <path d="M18 10 V18" />
        {/* Left Arm (static part) */}
        <path d="M10 8 L6 10" />
        
        {/* Swinging Scales Group */}
        <g ref={scalesRef} className="nyaya-scales-swing">
          <path d="M4 10 H8" />
          <path d="M4 10 L3 14 H5 Z" />
          <path d="M8 10 L7 14 H9 Z" />
        </g>
      </svg>
      {text && (
        <div className="font-mono text-sm tracking-widest uppercase text-slate animate-pulse">
          {text}
        </div>
      )}
    </div>
  );
}
