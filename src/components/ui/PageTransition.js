"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import gsap from "gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import NyayaIcon from "./NyayaIcon";

export default function PageTransition() {
  const overlayRef = useRef(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prefersReducedMotion = useReducedMotion();
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (prefersReducedMotion) return;
    
    // Skip animation on the very first page load
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    const overlay = overlayRef.current;
    if (!overlay) return;

    // The overlay is currently covering the screen (set by AnimatedLink)
    // We animate it UP to reveal the new page
    const tl = gsap.timeline({
      onComplete: () => {
        // Reset overlay position for the next exit animation
        gsap.set(overlay, { yPercent: 100 });
        gsap.set("#page-transition-icon", { opacity: 0 });
      }
    });

    tl.to("#page-transition-icon", { opacity: 0, duration: 0.3 })
      .to(overlay, {
        yPercent: -100,
        duration: 0.8,
        ease: "power4.inOut"
      }, "-=0.1");

  }, [pathname, searchParams, prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <div 
      id="page-transition-overlay"
      ref={overlayRef}
      className="fixed inset-0 z-[9998] pointer-events-none translate-y-full flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--ink)_0%,_#050608_100%)]"
      style={{ willChange: "transform" }}
    >
      <NyayaIcon 
        id="page-transition-icon"
        size={120}
        strokeColor="var(--paper)"
        className="opacity-0"
      />
    </div>
  );
}
