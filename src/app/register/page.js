"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { triggerPageTransition } from "@/lib/utils/transitionHelper";
import AnimatedLink from "@/components/ui/AnimatedLink";
import MagneticButton from "@/components/ui/MagneticButton";
import gsap from "gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "litigant"
  });
  const [error, setError] = useState("");
  const cardRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion || !cardRef.current) return;
    gsap.fromTo(cardRef.current, 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    );
  }, [prefersReducedMotion]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Registration failed");
      }
      
      // Auto-redirect to login
      triggerPageTransition(router, "/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <div ref={cardRef} className="bg-paper p-8 max-w-md w-full border border-ink/20 shadow-[8px_8px_0px_rgba(11,13,16,1)] opacity-0" style={prefersReducedMotion ? {opacity: 1} : {}}>
        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-3xl text-ink tracking-tight mb-2">Join NyaySahayak</h1>
          <p className="font-mono text-xs text-slate uppercase tracking-widest">Portal Access</p>
        </div>

        <div className="hairline-rule" />

        {error && (
          <div className="bg-seal-crimson/10 border border-seal-crimson p-3 mb-6 text-seal-crimson font-mono text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block font-mono text-xs text-slate uppercase tracking-wider">Full Name</label>
            <input 
              type="text" 
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-paper border border-slate/40 px-4 py-3 text-ink focus:border-ink focus:ring-1 focus:ring-ink transition-colors focus:outline-none"
              placeholder="Satyajit Ray"
            />
          </div>

          <div className="space-y-2">
            <label className="block font-mono text-xs text-slate uppercase tracking-wider">Email Address</label>
            <input 
              type="email" 
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-paper border border-slate/40 px-4 py-3 text-ink focus:border-ink focus:ring-1 focus:ring-ink transition-colors focus:outline-none"
              placeholder="name@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="block font-mono text-xs text-slate uppercase tracking-wider">Password</label>
            <input 
              type="password" 
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-paper border border-slate/40 px-4 py-3 text-ink focus:border-ink focus:ring-1 focus:ring-ink transition-colors focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-2">
            <label className="block font-mono text-xs text-slate uppercase tracking-wider">Requested Role</label>
            <div className="relative">
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-paper border border-slate/40 px-4 py-3 text-ink focus:border-ink focus:ring-1 focus:ring-ink transition-colors focus:outline-none appearance-none font-sans"
              >
                <option value="litigant">Litigant / Citizen</option>
                <option value="lawyer">Advocate / Lawyer</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          <MagneticButton
            type="submit" 
            disabled={loading}
            className="w-full bg-ink text-paper font-mono uppercase tracking-widest text-sm py-4 hover:bg-ink/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register & Access"}
          </MagneticButton>
        </form>

        <div className="mt-8 text-center">
          <p className="font-sans text-sm text-slate">
            Already have an account?{" "}
            <AnimatedLink href="/login" className="text-ink font-medium hover:underline hover:text-verdict-gold transition-colors">
              Log in here
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
