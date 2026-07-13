"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { triggerPageTransition } from "@/lib/utils/transitionHelper";
import NyayaLoader from "@/components/ui/NyayaLoader";

export default function RoleSwitcher() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Ensure this only renders on the client to prevent hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Security guard - only render in dev
  if (process.env.NODE_ENV === "production") return null;

  const roles = [
    { id: "litigant", label: "Mock Litigant", path: "/dashboard/party" },
    { id: "lawyer", label: "Mock Lawyer", path: "/dashboard/party" },
    { id: "clerk", label: "Mock Clerk", path: "/dashboard/staff" },
    { id: "judge", label: "Mock Judge", path: "/dashboard/staff" },
    { id: "admin", label: "Mock Admin", path: "/dashboard/admin" },
  ];

  const handleMockLogin = async (role, path) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/mock-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      if (!res.ok) throw new Error("Mock login failed");

      setIsOpen(false);
      // Trigger transition and then use router to preserve layout components (ink wash, backgrounds)
      triggerPageTransition({ 
        push: (href) => { 
          const url = new URL(href, window.location.origin);
          url.searchParams.set('_t', Date.now());
          router.push(url.pathname + url.search);
          router.refresh(); 
        } 
      }, path);
    } catch (err) {
      console.error(err);
      alert("Failed to hot-swap role. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setIsOpen(false);
      triggerPageTransition({ 
        push: (href) => { 
          router.push(href);
          router.refresh(); 
        } 
      }, "/login");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 font-mono text-xs">
      {isOpen && (
        <div className="absolute bottom-12 right-0 bg-paper border border-ink shadow-2xl p-2 w-48 mb-2">
          <div className="text-slate uppercase tracking-widest text-[10px] mb-2 pb-1 border-b border-ink/20">
            Dev: Hot Swap Role
          </div>
          <div className="flex flex-col space-y-1">
            {roles.map((r) => (
              <button
                key={r.id}
                disabled={loading}
                onClick={() => handleMockLogin(r.id, r.path)}
                className="text-left px-2 py-2 hover:bg-ink hover:text-paper transition-colors disabled:opacity-50"
              >
                {r.label}
              </button>
            ))}
            <div className="my-1 border-t border-ink/20"></div>
            <button
              disabled={loading}
              onClick={handleLogout}
              className="text-left px-2 py-2 text-seal-crimson hover:bg-seal-crimson hover:text-paper transition-colors disabled:opacity-50"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-ink/10 backdrop-blur-md text-verdict-gold border border-verdict-gold px-3 py-2 hover:bg-ink/30 transition-all active:scale-95 font-bold uppercase tracking-widest"
      >
        🛠 Dev Roles
      </button>
      {loading && (
        <NyayaLoader fullScreen={true} text="Switching role..." />
      )}
    </div>
  );
}
