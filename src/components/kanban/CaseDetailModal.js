"use client";

import { useEffect, useState, useRef } from "react";
import { format } from "date-fns";
import { X, Calendar, Clock, MapPin, User, FileText, ChevronRight, Upload } from "lucide-react";
import FileUploader from "@/components/ui/FileUploader";
import NyayaLoader from "@/components/ui/NyayaLoader";

export default function CaseDetailModal({ caseId, onClose, onUpdated }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("timeline"); // timeline | hearings | docs
  const [isUploading, setIsUploading] = useState(false);
  const containerRef = useRef(null);
  
  // Hearing form state
  const [judges, setJudges] = useState([]);
  const [schedDate, setSchedDate] = useState("");
  const [courtroom, setCourtroom] = useState("");
  const [judgeId, setJudgeId] = useState("");
  const [holidayWarning, setHolidayWarning] = useState(null);
  const [forceSchedule, setForceSchedule] = useState(false);
  const [holidaysCache, setHolidaysCache] = useState({});

  useEffect(() => {
    fetchCaseData();
    fetchJudges();
    
    // Pre-fetch current year's holidays
    const currentYear = new Date().getFullYear();
    fetchHolidays(currentYear);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  const fetchHolidays = async (year) => {
    if (holidaysCache[year]) return;
    try {
      const res = await fetch(`/api/holidays?year=${year}`);
      if (res.ok) {
        const data = await res.json();
        setHolidaysCache(prev => ({ ...prev, [year]: data }));
      }
    } catch (err) {
      console.error("Failed to fetch holidays", err);
    }
  };

  useEffect(() => {
    setHolidayWarning(null);
    setForceSchedule(false);

    if (!schedDate) return;

    const dateObj = new Date(schedDate);
    const year = dateObj.getFullYear();
    
    // Ensure holidays for this year are fetched
    if (!holidaysCache[year]) {
      fetchHolidays(year);
      return; // Will re-run when holidaysCache updates
    }

    // Check if date matches a holiday
    const dateString = format(dateObj, "yyyy-MM-dd");
    const holiday = holidaysCache[year].find(h => h.date === dateString);
    
    if (holiday) {
      setHolidayWarning(holiday.localName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedDate, holidaysCache]);

  const fetchCaseData = async () => {
    try {
      const res = await fetch(`/api/cases/${caseId}`);
      if (res.ok) {
        const d = await res.json();
        setData(d);
        if (d.judgeId) setJudgeId(d.judgeId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchJudges = async () => {
    try {
      const res = await fetch("/api/users/judges");
      if (res.ok) setJudges(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleScheduleHearing = async (e) => {
    e.preventDefault();
    
    // If there is a holiday warning and they haven't explicitly clicked "Schedule anyway"
    if (holidayWarning && !forceSchedule) {
      setForceSchedule(true);
      return;
    }

    try {
      const res = await fetch(`/api/cases/${caseId}/hearings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ judgeId, scheduledDate: schedDate, courtroom })
      });
      if (!res.ok) {
        const err = await res.json();
        alert(`Error: ${err.error}`);
        return;
      }
      setSchedDate("");
      setCourtroom("");
      fetchCaseData();
      onUpdated();
    } catch (err) {
      alert("Failed to schedule hearing.");
    }
  };

  const handleUploadComplete = () => {
    fetchCaseData();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-ink/40 backdrop-blur-md transition-all">
        <div className="bg-paper w-full max-w-5xl h-[85vh] flex flex-col items-center justify-center shadow-2xl relative border border-ink/30 overflow-hidden">
          <NyayaLoader text="Loading case details..." />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-ink/40 backdrop-blur-md transition-all">
      <div className="bg-paper w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl relative border border-ink/30 overflow-hidden">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-ink/20 flex justify-between items-start bg-paper">
          <div>
            <div className="font-mono text-sm text-slate mb-1">
              {data.caseNumber} {data.courtName && `• ${data.courtName}`}
            </div>
            <h2 className="font-display font-bold text-3xl text-ink leading-tight">{data.title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate hover:text-seal-crimson transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Left Column - History */}
          <div className="w-2/3 border-r border-ink/20 flex flex-col bg-paper overflow-y-auto">
            
            {/* Case Facts */}
            {data.caseDescription && (
              <div className="p-8 pb-6 border-b border-ink/10 bg-ink/5">
                <h3 className="font-display font-semibold text-lg text-ink mb-2">Case Facts</h3>
                <p className="font-sans text-sm text-slate mb-4 leading-relaxed">{data.caseDescription}</p>
                {data.reliefSought && (
                  <div className="bg-paper p-4 border border-ink/10 border-l-2 border-l-verdict-gold">
                    <h4 className="font-mono text-[10px] uppercase tracking-widest text-ink/50 mb-1">Relief Sought</h4>
                    <p className="font-sans text-sm text-ink">{data.reliefSought}</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex border-b border-ink/20 font-mono text-xs uppercase tracking-widest sticky top-0 bg-paper z-10">
              <button 
                onClick={() => setActiveTab("timeline")}
                className={`flex-1 py-4 text-center ${activeTab === "timeline" ? "bg-ink text-paper" : "text-slate hover:bg-ink/5"}`}
              >
                Audit Log Timeline
              </button>
              <button 
                onClick={() => setActiveTab("hearings")}
                className={`flex-1 py-4 text-center border-l border-ink/20 ${activeTab === "hearings" ? "bg-ink text-paper" : "text-slate hover:bg-ink/5"}`}
              >
                Hearings
              </button>
              <button 
                onClick={() => setActiveTab("docs")}
                className={`flex-1 py-4 text-center border-l border-ink/20 ${activeTab === "docs" ? "bg-ink text-paper" : "text-slate hover:bg-ink/5"}`}
              >
                Documents
              </button>
            </div>

            <div className="p-8">
              {activeTab === "timeline" && (
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[5.5rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-ink/20 before:to-transparent">
                  {data.auditLogs?.map(log => (
                    <div key={log._id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-3 h-3 rounded-full border border-paper bg-verdict-gold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-paper border border-slate/20 p-4 shadow-sm">
                        <div className="flex items-center justify-between space-x-2 mb-1">
                          <div className="font-bold text-ink text-sm capitalize">{log.action.replace('_', ' ')}</div>
                          <time className="font-mono text-[10px] text-slate">{format(new Date(log.timestamp), "yyyy-MM-dd HH:mm")}</time>
                        </div>
                        <div className="text-sm text-slate">{log.reason || "Status transition"}</div>
                        <div className="text-xs text-slate mt-2 opacity-60">By: {log.actorRole}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "hearings" && (
                <div className="space-y-4">
                  {data.hearings?.map(h => (
                    <div key={h._id} className="border border-ink/20 p-4 bg-paper/50">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-display font-semibold text-lg">{format(new Date(h.scheduledDate), "MMM do, yyyy - h:mm a")}</div>
                          <div className="font-mono text-xs text-slate mt-1">Courtroom: {h.courtroom}</div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-mono uppercase ${h.status === 'scheduled' ? 'bg-verdict-gold text-ink' : 'bg-sage text-paper'}`}>
                          {h.status}
                        </span>
                      </div>
                      {h.notes && (
                        <div className="mt-4 pt-3 border-t border-ink/10">
                          <p className="font-mono text-[10px] uppercase tracking-widest text-slate mb-1">Hearing Notes</p>
                          <p className="text-sm font-sans text-ink/90">{h.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                  {(!data.hearings || data.hearings.length === 0) && <p className="text-slate font-mono text-sm text-center py-8">No hearings scheduled.</p>}
                </div>
              )}

              {activeTab === "docs" && (
                <div className="space-y-4">
                  {/* Documents List */}
                  <div className="space-y-3 mb-8">
                    {data.documents?.length === 0 ? (
                      <div className="text-sm font-mono text-ink/40 p-4 border border-dashed border-ink/20 text-center">No documents uploaded yet</div>
                    ) : (
                      data.documents?.map(doc => (
                        <a 
                          key={doc._id} 
                          href={doc.fileUrl || "#"} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-4 border border-ink/20 bg-ink/5 hover:bg-ink/10 transition-colors group cursor-pointer"
                        >
                          <div className="flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-seal-crimson opacity-70" />
                            <span className="font-mono text-sm group-hover:text-seal-crimson transition-colors">{doc.title}</span>
                          </div>
                          <span className="text-xs font-mono text-ink/40">
                            {new Date(doc.uploadedAt).toLocaleDateString()}
                          </span>
                        </a>
                      ))
                    )}
                  </div>

                  {/* Upload Section */}
                  <div className="mt-8">
                    <h4 className="font-display font-semibold text-lg mb-4">Upload New Document</h4>
                    <FileUploader 
                      caseId={caseId}
                      isUploading={isUploading}
                      setIsUploading={setIsUploading}
                      onUploadComplete={handleUploadComplete}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Actions */}
          <div className="w-1/3 bg-paper p-8 overflow-y-auto">
            <h3 className="font-display font-bold text-xl text-ink mb-6 pb-2 border-b border-ink/20">Schedule Hearing</h3>
            <form onSubmit={handleScheduleHearing} className="space-y-4">
              
              <div className="space-y-2">
                <label className="block font-mono text-xs text-slate uppercase tracking-wider">Date & Time</label>
                <input 
                  type="datetime-local" 
                  required
                  value={schedDate}
                  onChange={e => setSchedDate(e.target.value)}
                  className="w-full bg-paper border border-slate/40 px-3 py-2 text-ink text-sm focus:border-ink focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-mono text-xs text-slate uppercase tracking-wider">Courtroom</label>
                <input 
                  type="text" 
                  required
                  value={courtroom}
                  onChange={e => setCourtroom(e.target.value)}
                  placeholder="e.g. Room 402"
                  className="w-full bg-paper border border-slate/40 px-3 py-2 text-ink text-sm focus:border-ink focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-mono text-xs text-slate uppercase tracking-wider">Assign Judge</label>
                <select
                  required
                  value={judgeId}
                  onChange={e => setJudgeId(e.target.value)}
                  className="w-full bg-paper border border-slate/40 px-3 py-2 text-ink text-sm focus:border-ink focus:outline-none appearance-none"
                >
                  <option value="">-- Select Judge --</option>
                  {judges.map(j => (
                    <option key={j._id} value={j._id}>{j.name}</option>
                  ))}
                </select>
                <p className="font-mono text-[10px] text-slate/70 mt-1">Updates case&apos;s judgeId</p>
              </div>

              <button 
                type="submit" 
                className={`w-full font-mono uppercase tracking-widest text-xs py-3 transition-colors mt-4 ${
                  holidayWarning && forceSchedule 
                    ? "bg-seal-crimson text-paper hover:bg-seal-crimson/90"
                    : holidayWarning
                      ? "bg-seal-crimson text-paper hover:bg-seal-crimson/90"
                      : "bg-ink text-paper hover:bg-ink/90"
                }`}
              >
                {holidayWarning 
                  ? (forceSchedule ? "Confirm Scheduling" : `Schedule Anyway — ${holidayWarning}`)
                  : "Schedule & Save"}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
