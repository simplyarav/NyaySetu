"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function AnimatedCounter({ value, duration = 1.5, className }) {
  const elementRef = useRef(null);
  const [displayValue, setDisplayValue] = useState("0");
  const prefersReducedMotion = useReducedMotion();
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayValue(value.toLocaleString());
      return;
    }

    const el = elementRef.current;
    if (!el || hasAnimated.current) return;

    const obj = { val: 0 };
    
    ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      onEnter: () => {
        if (hasAnimated.current) return;
        hasAnimated.current = true;
        
        gsap.to(obj, {
          val: value,
          duration: duration,
          ease: "power2.out",
          onUpdate: () => {
            setDisplayValue(Math.floor(obj.val).toLocaleString());
          },
        });
      },
      once: true
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => {
        if (t.trigger === el) t.kill();
      });
    };
  }, [value, duration, prefersReducedMotion]);

  return <span ref={elementRef} className={className}>{displayValue}</span>;
}
