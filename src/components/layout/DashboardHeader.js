"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AccountSettingsModal from "@/components/ui/AccountSettingsModal";
import { triggerPageTransition } from "@/lib/utils/transitionHelper";

export default function DashboardHeader() {
  const router = useRouter();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      triggerPageTransition(router, "/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <>
      <header className="w-full bg-ink text-paper px-8 py-4 flex justify-between items-center z-40 relative shadow-md">
        <div className="flex items-center space-x-4">
          <div className="font-display font-black text-xl tracking-tight text-paper">NyaySahayak</div>
          <div className="h-4 w-px bg-paper/20"></div>
          <div className="font-mono text-xs uppercase tracking-widest text-paper/70">Unified Dashboard</div>
        </div>

        <div className="flex items-center space-x-6">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="font-mono text-xs uppercase tracking-widest text-paper/80 hover:text-verdict-gold transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Settings</span>
          </button>
          
          <button 
            onClick={handleLogout}
            className="font-mono text-xs uppercase tracking-widest text-seal-crimson hover:text-seal-crimson/80 transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <AccountSettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </>
  );
}
