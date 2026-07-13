"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";

export default function TextScramble({ text, className }) {
  const [displayText, setDisplayText] = useState(text);
  const elementRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (prefersReducedMotion || hasAnimated.current || !text) {
      setDisplayText(text);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          animateScramble();
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, prefersReducedMotion]);

  const animateScramble = () => {
    let iteration = 0;
    const maxIterations = 10;
    const interval = 50; // 10 * 50ms = 500ms

    const intervalId = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((char, index) => {
            if (index < (iteration / maxIterations) * text.length) {
              return text[index];
            }
            // Preserve spaces
            if (char === " " || char === "-") return char;
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );

      iteration++;

      if (iteration >= maxIterations) {
        clearInterval(intervalId);
        setDisplayText(text);
      }
    }, interval);
  };

  return (
    <span ref={elementRef} className={className}>
      {displayText}
    </span>
  );
}
