"use client";

import { useEffect, useState } from "react";
import TimelineLedger from "@/components/TimelineLedger";
import NyayaIcon from "@/components/ui/NyayaIcon";
import NyayaLoader from "@/components/ui/NyayaLoader";

export default function PartyDashboard() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  
  // Data for the ledger view
  const [ledgerCase, setLedgerCase] = useState(null);
  const [ledgerLogs, setLedgerLogs] = useState([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  useEffect(() => {
    fetchMyCases();
  }, []);

  const fetchMyCases = async () => {
    try {
      const res = await fetch("/api/cases");
      const data = await res.json();
      if (res.ok) setCases(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCaseLedger = async (id) => {
    setSelectedCaseId(id);
    setLedgerLoading(true);
    try {
      const res = await fetch(`/api/cases/${id}`);
      if (res.ok) {
        const data = await res.json();
        setLedgerCase(data);
        // The endpoint already returns auditLogs
        // But for consistency with public endpoint, we can sort chronologically
        const chronologicalLogs = [...(data.auditLogs || [])].sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp));
        setLedgerLogs(chronologicalLogs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLedgerLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full bg-transparent flex flex-col items-center justify-center">
        <NyayaLoader text="Loading your cases..." />
      </div>
    );
  }

  return (
    <div className="h-full bg-transparent flex flex-col md:flex-row">
      {/* Left Sidebar: Case List */}
      <div className="w-full md:w-1/3 border-r border-ink/20 h-full overflow-y-auto bg-transparent relative z-10 shrink-0">
        <div className="p-8 border-b border-ink/20 sticky top-0 bg-paper z-10">
          <h1 className="text-2xl font-display font-bold text-ink">My Cases</h1>
          <p className="font-mono text-xs text-slate mt-1 uppercase tracking-widest">{cases.length} active records</p>
        </div>

        <div className="p-4 space-y-4">
          {cases.map(c => (
            <button
              key={c._id}
              onClick={() => loadCaseLedger(c._id)}
              className={`w-full text-left p-4 border transition-all ${
                selectedCaseId === c._id 
                  ? "border-ink bg-ink text-paper scale-[1.02]" 
                  : "border-ink/20 bg-paper hover:border-ink/50 text-ink"
              }`}
            >
              <div className="font-mono text-xs opacity-70 mb-1">{c.caseNumber}</div>
              <div className="font-display font-semibold mb-2">{c.title}</div>
              <div className="flex justify-between items-center mt-4">
                <span className="font-mono text-[10px] uppercase tracking-widest opacity-80">{c.status.replace("_", " ")}</span>
                <span className={`w-3 h-3 border border-current ${
                  c.pendencyScore < 30 ? "bg-sage" : c.pendencyScore < 70 ? "bg-verdict-gold" : "bg-seal-crimson"
                }`} />
              </div>
            </button>
          ))}
          {cases.length === 0 && (
            <div className="p-8 text-center border border-ink/10 bg-paper flex flex-col items-center justify-center">
              <NyayaIcon size={48} className="text-slate opacity-40 mb-4" />
              <h3 className="font-display font-semibold text-lg text-ink mb-2">No Active Litigation</h3>
              <p className="font-sans text-sm text-slate">You do not currently have any cases assigned to your docket.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Area - Ledger View */}
      <div className="w-full md:w-2/3 h-screen overflow-y-auto bg-slate/5 p-4 md:p-12 flex items-start justify-center">
        {ledgerLoading ? (
          <div className="w-full max-w-3xl mx-auto h-[600px] bg-ink/5 animate-pulse border border-ink/5 mt-8 relative overflow-hidden flex items-center justify-center">
            <NyayaIcon size={120} className="text-ink opacity-5" />
          </div>
        ) : selectedCaseId && ledgerCase ? (
          <TimelineLedger caseData={ledgerCase} logs={ledgerLogs} />
        ) : (
          <div className="mt-40 text-center flex flex-col items-center">
            <NyayaIcon size={80} className="text-slate opacity-20 mb-6" />
            <p className="font-mono text-slate text-sm">Select a case from the sidebar to view its docket ledger.</p>
          </div>
        )}
      </div>
    </div>
  );
}
