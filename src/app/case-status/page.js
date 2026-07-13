"use client";

import { useState, useEffect, Suspense } from "react";
import TimelineLedger from "@/components/TimelineLedger";
import AnimatedLink from "@/components/ui/AnimatedLink";
import { useSearchParams } from "next/navigation";
import NyayaIcon from "@/components/ui/NyayaIcon";

function CaseStatusContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q");
  
  const [searchQuery, setSearchQuery] = useState(q || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (q) {
      performSearch(q);
    }
  }, [q]);

  const performSearch = async (query) => {
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`/api/public/cases/${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch case status");
      }
      
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  return (
    <div className="flex-1 flex flex-col items-center p-6 md:p-12 relative overflow-hidden w-full">
      
      {/* Search Section */}
      <div className={`w-full max-w-2xl transition-all duration-500 ease-in-out ${result ? "mb-12" : "mt-24 mb-0"}`}>
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold text-ink mb-4">Check Case Status</h1>
          <p className="font-sans text-slate">Enter your official Case Number to view the chronological docket and current pendency metrics.</p>
        </div>

        <form onSubmit={handleSearch} className="relative border-4 border-ink">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="e.g. CV-2026-000123"
            className="w-full bg-paper px-6 py-5 text-lg font-mono text-ink placeholder:text-slate/40 focus:outline-none focus-visible:ring-0 pr-32"
            required
          />
          <button 
            type="submit"
            disabled={loading}
            className="absolute right-2 top-2 bottom-2 bg-ink text-paper font-mono uppercase tracking-widest text-sm px-6 hover:bg-ink/90 transition-colors disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-seal-crimson focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
          >
            {loading ? "..." : "Search"}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-6 bg-paper border border-seal-crimson text-center flex flex-col items-center">
            <svg className="w-8 h-8 text-seal-crimson mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <h3 className="font-display font-semibold text-lg text-ink mb-1">Docket Not Found</h3>
            <p className="font-sans text-slate text-sm">Please verify the case number and try again.</p>
          </div>
        )}
      </div>

      {/* Results Section */}
      <div className="w-full max-w-3xl animate-in slide-in-from-bottom-8 fade-in duration-700 pb-20">
        {loading ? (
          <div className="w-full h-[600px] bg-ink/5 animate-pulse border border-ink/5 relative overflow-hidden flex items-center justify-center">
            <NyayaIcon size={120} className="text-ink opacity-5" />
          </div>
        ) : result && (
          <TimelineLedger caseData={result.case} logs={result.logs} />
        )}
      </div>

    </div>
  );
}

export default function CaseStatusPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="p-6 border-b border-ink/10 flex justify-between items-center bg-paper/50 backdrop-blur-sm sticky top-0 z-10">
        <AnimatedLink href="/" className="font-display font-bold text-2xl text-ink hover:text-ink/80 transition-colors">
          NyaySahayak
        </AnimatedLink>
        <span className="font-mono text-xs uppercase tracking-widest text-slate">Public Portal</span>
      </nav>

      <main className="flex-1 flex flex-col items-center relative overflow-hidden">
        <Suspense fallback={<div className="mt-24 font-mono animate-pulse">Loading Search...</div>}>
          <CaseStatusContent />
        </Suspense>
      </main>
    </div>
  );
}
