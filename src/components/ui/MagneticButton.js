"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export default function MagneticButton({ children, className, onClick, type = "button", disabled = false }) {
  const buttonRef = useRef(null);
  const textRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion || disabled) return;

    const button = buttonRef.current;
    const text = textRef.current;
    if (!button || !text) return;

    // quickTo for high performance snapping
    const xTo = gsap.quickTo(button, "x", { duration: 0.4, ease: "power3" });
    const yTo = gsap.quickTo(button, "y", { duration: 0.4, ease: "power3" });
    
    // The text can move slightly further for a parallax feel
    const textXTo = gsap.quickTo(text, "x", { duration: 0.3, ease: "power2" });
    const textYTo = gsap.quickTo(text, "y", { duration: 0.3, ease: "power2" });

    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { height, width, left, top } = button.getBoundingClientRect();
      const x = clientX - (left + width / 2);
      const y = clientY - (top + height / 2);
      
      // Move slightly towards cursor (magnetic pull factor: 0.3)
      xTo(x * 0.3);
      yTo(y * 0.3);
      
      textXTo(x * 0.1);
      textYTo(y * 0.1);
    };

    const handleMouseLeave = () => {
      // Spring back to center
      xTo(0);
      yTo(0);
      textXTo(0);
      textYTo(0);
    };

    button.addEventListener("mousemove", handleMouseMove);
    button.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      button.removeEventListener("mousemove", handleMouseMove);
      button.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [prefersReducedMotion, disabled]);

  return (
    <button
      ref={buttonRef}
      className={className}
      onClick={onClick}
      type={type}
      disabled={disabled}
      style={{ willChange: "transform" }}
    >
      <span ref={textRef} className="inline-block pointer-events-none" style={{ willChange: "transform" }}>
        {children}
      </span>
    </button>
  );
}
