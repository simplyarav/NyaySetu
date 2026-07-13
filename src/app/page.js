"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileSignature, Stamp } from "lucide-react";
import AnimatedLink from "@/components/ui/AnimatedLink";
import { triggerPageTransition } from "@/lib/utils/transitionHelper";
import MagneticButton from "@/components/ui/MagneticButton";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import ScrollProgress from "@/components/ui/ScrollProgress";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  
  const headlineRef = useRef(null);
  const searchBarRef = useRef(null);
  const lineRef = useRef(null);
  const howItWorksRef = useRef(null);
  const step1Ref = useRef(null);
  const step2Ref = useRef(null);
  const step3Ref = useRef(null);
  const heroRef = useRef(null);
  
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (prefersReducedMotion) return;

    const tl = gsap.timeline();

    // 1. Hero Parallax
    gsap.to(".parallax-bg", {
      yPercent: 30,
      ease: "none",
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });

    // 2. Headline Scramble / Stagger
    const headline = headlineRef.current;
    if (headline) {
      const text = "Justice Accelerated. Transparency Delivered.";
      const words = text.split(" ");
      headline.innerHTML = "";
      words.forEach((word) => {
        const span = document.createElement("span");
        span.innerText = word + " ";
        span.style.display = "inline-block";
        span.style.opacity = "0";
        span.style.transform = "translateY(20px)";
        headline.appendChild(span);
      });

      tl.to(headline.querySelectorAll("span"), {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
      });
    }

    // 3. Search Bar fade & draw line
    if (searchBarRef.current) {
      tl.fromTo(searchBarRef.current, 
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
        "-=0.4"
      );
    }
    if (lineRef.current) {
      const length = lineRef.current.getTotalLength();
      gsap.set(lineRef.current, { strokeDasharray: length, strokeDashoffset: length });
      tl.to(lineRef.current, {
        strokeDashoffset: 0,
        duration: 1,
        ease: "power4.inOut"
      }, "-=0.2");
    }

    // 4. How It Works Scrollytelling
    const howSection = howItWorksRef.current;
    if (howSection) {
      const pinTl = gsap.timeline({
        scrollTrigger: {
          trigger: howSection,
          start: "top top",
          end: "+=300%",
          pin: true,
          pinSpacing: true,
          scrub: 1,
        }
      });

      // Show step 1
      pinTl.to(step1Ref.current, { opacity: 1, y: 0, duration: 1 })
           .to(step1Ref.current, { opacity: 0, y: -20, duration: 1 }, "+=1");
      
      // Show step 2
      pinTl.to(step2Ref.current, { opacity: 1, y: 0, duration: 1 }, "-=0.5")
           .to(step2Ref.current, { opacity: 0, y: -20, duration: 1 }, "+=1");

      // Show step 3
      pinTl.to(step3Ref.current, { opacity: 1, y: 0, duration: 1 }, "-=0.5");
    }

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [prefersReducedMotion]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Use the transition helper
    triggerPageTransition(router, `/case-status?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <main className="flex flex-col overflow-x-hidden">
      <ScrollProgress />
      
      {/* Navbar */}
      <nav className="p-8 flex justify-between items-center relative z-50 mix-blend-difference text-paper">
        <div className="flex items-center space-x-3">
          {/* Nyaya Figure SVG */}
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="4" r="2" />
            <path d="M10 6 L6 22 H18 L14 6 Z" />
            <path d="M10 8 L6 10" />
            <path d="M4 10 H8" />
            <path d="M4 10 L3 14 H5 Z" />
            <path d="M8 10 L7 14 H9 Z" />
            <path d="M14 8 L18 11" />
            <path d="M17 11 H19" />
            <path d="M18 10 V18" />
          </svg>
          <div className="flex flex-col">
            <span className="font-display font-bold text-2xl leading-none">NyaySahayak</span>
            <span className="font-sans font-semibold text-[10px] text-verdict-gold tracking-widest mt-1">न्याय</span>
          </div>
        </div>
        <div className="space-x-6 font-mono text-xs uppercase tracking-widest flex items-center">
          <AnimatedLink href="/login" className="hover:text-verdict-gold transition-colors">Staff Login</AnimatedLink>
          <AnimatedLink href="/register" className="border border-paper px-4 py-2 hover:bg-paper hover:text-ink transition-colors">
            Portal Access
          </AnimatedLink>
        </div>
      </nav>
      
      {/* Tricolor Accent Rule below Navbar */}
      <div className="w-full h-[2px] tricolor-rule relative z-50 opacity-80" />

      {/* Hero Section */}
      <section ref={heroRef} className="relative h-screen flex flex-col items-center justify-center px-4 -mt-24">
        
        {/* Parallax Background Layers */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="parallax-bg absolute top-1/4 -left-32 w-96 h-96 bg-sage rounded-full filter blur-[100px] opacity-20" />
          <div className="parallax-bg absolute bottom-1/4 -right-32 w-[30rem] h-[30rem] bg-verdict-gold rounded-full filter blur-[100px] opacity-20 delay-75" />
        </div>
        
        <h1 
          ref={headlineRef}
          className="font-display font-black text-5xl md:text-7xl text-ink text-center max-w-4xl leading-[1.1] mb-12 relative z-10"
        >
          {prefersReducedMotion ? "Justice Accelerated. Transparency Delivered." : ""}
        </h1>

        <div ref={searchBarRef} className="w-full max-w-2xl relative z-10">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Track public case (e.g. CV-2026-000123)"
              className="w-full bg-transparent px-2 py-4 text-2xl font-mono text-ink placeholder:text-slate/40 focus:outline-none"
            />
            <MagneticButton type="submit" className="absolute right-0 top-1/2 -translate-y-1/2 p-4 text-ink hover:text-verdict-gold transition-colors">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </MagneticButton>
          </form>

          <div className="absolute bottom-0 left-0 right-0 h-1 z-0">
            <svg width="100%" height="4" preserveAspectRatio="none" className="overflow-visible">
              <line 
                ref={lineRef}
                x1="0" y1="2" x2="100%" y2="2" 
                stroke="currentColor" 
                strokeWidth="4" 
                className="text-ink" 
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* The Problem (Stat Block) */}
      <section className="py-32 px-8 bg-ink text-paper relative z-10 overflow-hidden">
        {/* Colonial High Court Watermark Motif */}
        <svg 
          viewBox="0 0 100 100" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="0.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="absolute -right-16 top-1/2 -translate-y-1/2 w-[600px] h-[600px] text-paper opacity-[0.03] pointer-events-none"
        >
          <path d="M10 90 H90" />
          <path d="M20 90 V50 H80 V90" />
          <path d="M40 90 V70 C40 65 45 60 50 50 C55 60 60 65 60 70 V90" />
          <path d="M30 50 C30 20 45 30 50 10 C55 30 70 20 70 50" />
          <path d="M50 10 V2" />
        </svg>
        
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10">
          <div>
            <h2 className="font-display font-semibold text-3xl mb-4 text-verdict-gold">The Backlog Crisis</h2>
            <p className="font-sans text-paper/80 leading-relaxed text-lg">
              Millions of cases languish in courts due to systemic inefficiencies, manual processing, and lack of transparency. We are digitizing the docket to restore faith in the system.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="border-l border-paper/20 pl-6 flex flex-col justify-center">
              <div className="font-display font-black text-5xl text-seal-crimson mb-2 flex items-baseline whitespace-nowrap overflow-hidden">
                <AnimatedCounter value={50000000} duration={2.5} />
                <span className="ml-1">+</span>
              </div>
              <div className="font-mono text-xs uppercase tracking-widest text-paper/60">Pending Cases</div>
            </div>
            <div className="border-l border-paper/20 pl-6 flex flex-col justify-center">
              <div className="font-display font-black text-5xl text-sage mb-2 flex items-baseline whitespace-nowrap overflow-hidden">
                <AnimatedCounter value={14} duration={2} />
                <span className="ml-2 text-3xl">Yrs</span>
              </div>
              <div className="font-mono text-xs uppercase tracking-widest text-paper/60">Avg. Resolution Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (Scrollytelling) */}
      <section ref={howItWorksRef} className="h-screen flex items-center justify-center overflow-hidden relative">
        <div className="text-center absolute inset-0 flex flex-col items-center justify-center p-8">
          <h2 className="font-display font-bold text-4xl text-ink absolute top-32">How It Works</h2>
          
          <div className="relative w-full max-w-3xl h-64 mt-16">
            <div ref={step1Ref} className={`absolute inset-0 flex flex-col items-center justify-center ${prefersReducedMotion ? 'static opacity-100 translate-y-0 mb-12' : 'opacity-0 translate-y-10'}`}>
              <FileSignature className="w-12 h-12 text-seal-crimson mb-4" />
              <h3 className="font-display text-3xl font-semibold mb-2">Digital Filing</h3>
              <p className="font-sans text-slate text-lg">Lawyers submit evidence and pleadings securely online. No more missing physical files.</p>
            </div>

            <div ref={step2Ref} className={`absolute inset-0 flex flex-col items-center justify-center ${prefersReducedMotion ? 'static opacity-100 translate-y-0 mb-12' : 'opacity-0 translate-y-10'}`}>
              {/* Nyaya Figure SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="text-verdict-gold mb-4">
                <circle cx="12" cy="4" r="2" />
                <path d="M10 6 L6 22 H18 L14 6 Z" />
                <path d="M10 8 L6 10" />
                <path d="M4 10 H8" />
                <path d="M4 10 L3 14 H5 Z" />
                <path d="M8 10 L7 14 H9 Z" />
                <path d="M14 8 L18 11" />
                <path d="M17 11 H19" />
                <path d="M18 10 V18" />
              </svg>
              <h3 className="font-display text-3xl font-semibold mb-2">Automated Docketing</h3>
              <p className="font-sans text-slate text-lg">Our state machine routes the case through standard legal procedures, eliminating clerical delays.</p>
            </div>

            <div ref={step3Ref} className={`absolute inset-0 flex flex-col items-center justify-center ${prefersReducedMotion ? 'static opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <Stamp className="w-12 h-12 text-sage mb-4" />
              <h3 className="font-display text-3xl font-semibold mb-2">Transparent Resolution</h3>
              <p className="font-sans text-slate text-lg">Public timelines allow citizens to monitor progress, holding the system accountable.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tricolor Accent Rule above Footer */}
      <div className="w-full h-[2px] tricolor-rule opacity-50" />
      
      <footer className="p-8 border-t border-ink/10 text-center">
        <p className="font-mono text-xs text-slate">&copy; 2026 NyaySahayak. Justice Accelerated.</p>
      </footer>
    </main>
  );
}
