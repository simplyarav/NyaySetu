import { format } from "date-fns";
import { generatePendencyExplanation } from "@/lib/pendencyExplanation";
import TextScramble from "@/components/ui/TextScramble";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Bot, Sparkles } from "lucide-react";

export default function TimelineLedger({ caseData, logs }) {
  const containerRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  
  const [aiSummary, setAiSummary] = useState(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiError, setAiError] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion || !containerRef.current) return;
    const entries = containerRef.current.querySelectorAll(".timeline-anim");
    gsap.fromTo(entries,
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }
    );
  }, [logs, prefersReducedMotion]);

  if (!caseData) return null;

  const explanation = generatePendencyExplanation(caseData);

  // Status mapping for visual order (though logs are chronological, we might want to map names)
  const formatStatus = (status) => status?.replace("_", " ")?.toUpperCase();

  const handleExplain = async () => {
    setIsLoadingAi(true);
    setAiError(false);
    try {
      const res = await fetch(`/api/cases/${caseData._id}/summary`, {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        setAiSummary(data.summary);
      } else {
        // Fallback gracefully to the rules-based explanation
        setAiError(true);
      }
    } catch (err) {
      console.error(err);
      setAiError(true);
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div ref={containerRef} className="bg-paper border border-ink/20 shadow-xl max-w-3xl w-full mx-auto relative overflow-hidden">
      {/* Ledger Header */}
      <div className="bg-ink text-paper p-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="font-mono text-sm tracking-widest text-paper/70 mb-1">
              DOCKET NO. <TextScramble text={caseData.caseNumber} />
              {caseData.courtName && ` • ${caseData.courtName.toUpperCase()}`}
            </p>
            <h1 className="font-display text-3xl font-bold">{caseData.title}</h1>
          </div>
          <span className="font-mono text-xs uppercase bg-paper/10 px-3 py-1 border border-paper/20">
            {caseData.caseType}
          </span>
        </div>
        
        <div className="bg-paper/5 border border-paper/10 p-4 mt-6">
          
          {caseData.caseDescription && (
            <div className="mb-6 pb-6 border-b border-paper/10">
              <h3 className="font-display font-semibold text-lg text-paper mb-2">Case Facts</h3>
              <p className="font-sans text-sm text-paper/90 mb-4 leading-relaxed">{caseData.caseDescription}</p>
              {caseData.reliefSought && (
                <div className="bg-paper/10 p-4 border-l-2 border-l-verdict-gold">
                  <h4 className="font-mono text-[10px] uppercase tracking-widest text-paper/50 mb-1">Relief Sought</h4>
                  <p className="font-sans text-sm text-paper">{caseData.reliefSought}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center space-x-4 mb-2">
            <span className="font-mono text-xs uppercase tracking-widest text-paper/70">Pendency Score:</span>
            <span className={`font-mono font-bold text-lg px-2 ${
              caseData.pendencyScore < 30 ? "text-sage" : 
              caseData.pendencyScore < 70 ? "text-verdict-gold" : "text-seal-crimson"
            }`}>
              {Math.round(caseData.pendencyScore || 0)}
            </span>
          </div>
          
          <div className="mt-4">
            {!aiSummary && !isLoadingAi && !aiError ? (
              <button 
                onClick={handleExplain}
                className="flex items-center space-x-2 bg-paper/10 hover:bg-paper/20 border border-paper/20 px-4 py-2 text-sm font-mono transition-colors group"
              >
                <Sparkles className="w-4 h-4 text-verdict-gold group-hover:scale-110 transition-transform" />
                <span>Explain this case in plain English</span>
              </button>
            ) : isLoadingAi ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-4 w-3/4 bg-paper/20 rounded"></div>
                <div className="h-4 w-1/2 bg-paper/20 rounded"></div>
              </div>
            ) : aiError ? (
              // Fallback to rules-based pendency explanation (Phase 6)
              <p className="font-sans text-sm text-paper/90 border-l-2 border-slate/40 pl-3">
                <span className="block font-mono text-[10px] uppercase text-paper/50 mb-1">Standard Analysis</span>
                {explanation}
              </p>
            ) : (
              // Display AI Summary
              <div className="bg-paper/10 border border-verdict-gold/30 p-4 rounded-sm relative">
                <Bot className="absolute top-4 right-4 w-5 h-5 text-verdict-gold/50" />
                <span className="block font-mono text-[10px] uppercase text-verdict-gold mb-2">AI Summary</span>
                <p className="font-sans text-sm text-paper/90 leading-relaxed pr-8">
                  {aiSummary}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ledger Body - Vertical Timeline */}
      <div className="p-8 pb-16">
        <h2 className="font-display font-semibold text-xl text-ink mb-8 border-b border-ink/10 pb-2">Case History Ledger</h2>
        
        <div className="relative pl-8 space-y-8 before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-[1px] before:bg-ink/20">
          
          {logs && logs.length > 0 ? (
            logs.map((log, index) => {
              const isLatest = index === logs.length - 1;
              return (
                <div key={index} className="relative timeline-anim opacity-0 interactive hover:-translate-y-[1px] hover:border hover:border-verdict-gold/50 p-2 -m-2 rounded transition-all duration-200" style={prefersReducedMotion ? {opacity: 1} : {}}>
                  {/* Ledger Dot */}
                  <div className={`absolute -left-8 flex items-center justify-center w-3 h-3 rounded-full border bg-paper -translate-x-1/2 top-1.5 ${
                    isLatest ? "border-verdict-gold ring-2 ring-verdict-gold/20" : "border-ink/40"
                  }`}>
                    {isLatest && <div className="w-1.5 h-1.5 bg-verdict-gold rounded-full" />}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-1">
                    <h3 className={`font-mono text-sm uppercase tracking-wider ${isLatest ? "text-ink font-bold" : "text-ink/70"}`}>
                      {log.action === "status_change" ? `Moved to ${formatStatus(log.toStatus)}` : log.action.replace("_", " ")}
                    </h3>
                    <time className="font-mono text-xs text-slate whitespace-nowrap mt-1 sm:mt-0">
                      {format(new Date(log.timestamp), "MMM do, yyyy")}
                    </time>
                  </div>
                  
                  {log.reason && (
                    <p className="text-sm font-sans text-slate mt-1 italic border-l-2 border-slate/20 pl-3 py-0.5">
                      &quot;{log.reason}&quot;
                    </p>
                  )}
                </div>
              );
            })
          ) : (
            <p className="font-mono text-sm text-slate">No history recorded yet.</p>
          )}

        </div>
      </div>

      {/* Decorative corner accents */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-paper/40"></div>
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-paper/40"></div>
    </div>
  );
}
