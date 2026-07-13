"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { triggerPageTransition } from "@/lib/utils/transitionHelper";
import AnimatedLink from "@/components/ui/AnimatedLink";
import MagneticButton from "@/components/ui/MagneticButton";
import gsap from "gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useBackground } from "@/contexts/BackgroundContext";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const cardRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  const { setVariant } = useBackground();

  useEffect(() => {
    // Set global background variant to dark for login
    setVariant("dark");
    return () => setVariant("light");
  }, [setVariant]);

  useEffect(() => {
    if (prefersReducedMotion || !cardRef.current) return;
    gsap.fromTo(cardRef.current, 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    );
  }, [prefersReducedMotion]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Login failed");
      }

      const data = await res.json();
      const role = data.role;
      
      // Role-based redirection
      let path = "/dashboard";
      if (role === "clerk" || role === "judge") {
        path = "/dashboard/staff";
      } else if (role === "litigant" || role === "lawyer") {
        path = "/dashboard/party";
      } else if (role === "admin") {
        path = "/dashboard/admin";
      }
      
      triggerPageTransition({
        push: (href) => {
          router.push(href);
          router.refresh();
        }
      }, path);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div ref={cardRef} className="bg-paper p-8 max-w-md w-full border border-ink/20 shadow-[8px_8px_0px_rgba(11,13,16,1)] opacity-0" style={prefersReducedMotion ? {opacity: 1} : {}}>
        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-4xl text-ink tracking-tight mb-2">NyaySetu</h1>
          <p className="font-mono text-xs text-slate uppercase tracking-widest">Secure Login</p>
        </div>

        <div className="hairline-rule" />

        {error && (
          <div className="bg-seal-crimson/10 border border-seal-crimson p-3 mb-6 text-seal-crimson font-mono text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block font-mono text-xs text-slate uppercase tracking-wider">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-paper border border-slate/40 px-4 py-3 text-ink focus:border-ink focus:ring-1 focus:ring-ink transition-colors focus:outline-none"
              placeholder="name@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="block font-mono text-xs text-slate uppercase tracking-wider">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-paper border border-slate/40 px-4 py-3 text-ink focus:border-ink focus:ring-1 focus:ring-ink transition-colors focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <MagneticButton
            type="submit" 
            disabled={loading}
            className="w-full bg-ink text-paper font-mono uppercase tracking-widest text-sm py-4 hover:bg-ink/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </MagneticButton>
        </form>

        <div className="mt-8 text-center">
          <p className="font-sans text-sm text-slate">
            Don&apos;t have an account?{" "}
            <AnimatedLink href="/register" className="text-ink font-medium hover:underline hover:text-verdict-gold transition-colors">
              Register here
            </AnimatedLink>
          </p>
        </div>
        
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-ink/40"></div>
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-ink/40"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-ink/40"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-ink/40"></div>
      </div>
    </div>
  );
}
