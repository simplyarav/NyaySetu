"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useBackground } from "@/contexts/BackgroundContext";
import gsap from "gsap";

const ScaleIcon = ({ color }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ color, width: "100%", height: "100%" }}
  >
    <path d="M12 3v18"/>
    <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>
    <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
    <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
    <path d="M7 21h10"/>
  </svg>
);

export default function CourtroomBackground() {
  const { variant } = useBackground();
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const gridConfig = useMemo(() => {
    const cols = 6;
    const rows = 5;
    const icons = [];
    
    for (let i = 0; i < cols * rows; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      
      const baseXPct = (col / cols) * 100;
      const baseYPct = (row / rows) * 100;
      
      const offsetX = Math.random() * (100 / cols * 0.7);
      const offsetY = Math.random() * (100 / rows * 0.7);
      
      icons.push({
        id: i,
        x: `${baseXPct + offsetX + 2}vw`,
        y: `${baseYPct + offsetY + 2}vh`,
        size: Math.floor(Math.random() * (40 - 24 + 1)) + 24,
        duration: 2 + Math.random() * 1.5,
        delay: Math.random() * 2
      });
    }
    return icons;
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || !mounted || !containerRef.current) return;
    
    const elements = containerRef.current.querySelectorAll('.scale-icon');
    const animations = [];

    elements.forEach((el, i) => {
      const config = gridConfig[i];
      gsap.set(el, { transformOrigin: "50% 0%", rotate: 0 });
      
      const anim = gsap.fromTo(el, 
        { rotate: -8 },
        {
          rotate: 8,
          duration: config.duration,
          delay: config.delay,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1
        }
      );
      animations.push(anim);
    });

    return () => {
      animations.forEach(a => a.kill());
    };
  }, [mounted, prefersReducedMotion, gridConfig]);

  const isDark = variant === "dark";
  const bgColor = isDark ? "#0b0d10" : "#f4f4f2";
  const iconColor = isDark ? "#ffffff" : "#1a1a1a";
  const opacity = isDark ? 0.10 : 0.15;

  return (
    <div 
      className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden transition-colors duration-700 ease-in-out"
      style={{ backgroundColor: bgColor }}
    >
      {mounted && (
        <div ref={containerRef} className="relative w-full h-full opacity-0" style={{ animation: "fadeIn 1s forwards" }}>
          {gridConfig.map((icon) => (
            <div 
              key={icon.id}
              className="absolute scale-icon"
              style={{
                left: icon.x,
                top: icon.y,
                width: `${icon.size}px`,
                height: `${icon.size}px`,
                opacity: opacity
              }}
            >
              <ScaleIcon color={iconColor} />
            </div>
          ))}
        </div>
      )}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}} />
    </div>
  );
}
