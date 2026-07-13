"use client";

import { useState, useEffect } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell 
} from "recharts";
import { ArrowUpRight, ArrowDownRight, Minus, AlertCircle } from "lucide-react";
import AnimatedLink from "@/components/ui/AnimatedLink";
import StaffManager from "@/components/admin/StaffManager";
import gsap from "gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useRef } from "react";
import NyayaLoader from "@/components/ui/NyayaLoader";

// Strictly stick to our color palette variables by wrapping them in hsl() so Recharts can parse them
const COLORS = ["var(--ink)", "var(--slate)", "var(--seal-crimson)", "var(--verdict-gold)", "var(--sage)"];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    fetch("/api/analytics")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch analytics");
        return res.json();
      })
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!loading && !error && !prefersReducedMotion && containerRef.current) {
      const elements = containerRef.current.querySelectorAll(".admin-anim");
      gsap.fromTo(elements,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" }
      );
    }
  }, [loading, error, prefersReducedMotion]);

  if (loading) {
    return (
      <div className="h-full bg-transparent flex flex-col items-center justify-center min-h-[600px]">
        <NyayaLoader text="Gathering analytics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-seal-crimson/10 border border-seal-crimson p-6 flex flex-col items-center justify-center space-y-4 max-w-xl mx-auto mt-24">
          <AlertCircle className="w-12 h-12 text-seal-crimson" />
          <h2 className="font-display font-semibold text-xl text-ink">Failed to load analytics</h2>
          <p className="font-sans text-slate text-center">{error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-seal-crimson text-paper font-mono text-xs uppercase tracking-widest hover:bg-seal-crimson/80 transition-colors">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { pendencyByType, closedTrends, statusDistribution, topStuckCases, summary } = data;

  const TrendArrow = ({ trend, inverse = false }) => {
    if (!trend) return <Minus className="w-4 h-4 text-slate" />;
    const isGood = inverse ? trend < 0 : trend > 0;
    const colorClass = isGood ? "text-sage" : "text-seal-crimson";
    return trend > 0 
      ? <ArrowUpRight className={`w-4 h-4 ${colorClass}`} />
      : <ArrowDownRight className={`w-4 h-4 ${colorClass}`} />;
  };

  return (
    <div ref={containerRef} className="p-8 max-w-7xl mx-auto">
      <h1 className="font-display text-4xl font-black text-ink mb-8 admin-anim opacity-0" style={prefersReducedMotion ? {opacity: 1} : {}}>System Analytics</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-paper border border-ink/20 p-6 shadow-sm admin-anim opacity-0" style={prefersReducedMotion ? {opacity: 1} : {}}>
          <div className="text-xs font-mono uppercase tracking-widest text-slate mb-2">Active Cases</div>
          <div className="flex items-end justify-between">
            <div className="text-4xl font-display font-bold text-ink">{summary.activeCases.value}</div>
            <div className="flex items-center space-x-1" title="Net change this month">
              <TrendArrow trend={summary.activeCases.trend} inverse={true} />
              <span className="text-sm font-mono">{Math.abs(summary.activeCases.trend)}</span>
            </div>
          </div>
        </div>

        <div className="bg-paper border border-ink/20 p-6 shadow-sm admin-anim opacity-0" style={prefersReducedMotion ? {opacity: 1} : {}}>
          <div className="text-xs font-mono uppercase tracking-widest text-slate mb-2">Avg Disposal (Days)</div>
          <div className="flex items-end justify-between">
            <div className="text-4xl font-display font-bold text-ink">{summary.avgDisposal.value}</div>
            <div className="flex items-center space-x-1" title="vs Last Month">
              <TrendArrow trend={summary.avgDisposal.trend} inverse={true} />
              <span className="text-sm font-mono">{Math.abs(summary.avgDisposal.trend)}</span>
            </div>
          </div>
        </div>

        <div className="bg-paper border border-ink/20 p-6 shadow-sm admin-anim opacity-0" style={prefersReducedMotion ? {opacity: 1} : {}}>
          <div className="text-xs font-mono uppercase tracking-widest text-slate mb-2">Avg Adjournments</div>
          <div className="flex items-end justify-between">
            <div className="text-4xl font-display font-bold text-ink">{summary.avgAdjournments.value}</div>
          </div>
        </div>

        <div className="bg-paper border border-ink/20 p-6 shadow-sm admin-anim opacity-0" style={prefersReducedMotion ? {opacity: 1} : {}}>
          <div className="text-xs font-mono uppercase tracking-widest text-slate mb-2">Cases &gt; 1 Year</div>
          <div className="flex items-end justify-between">
            <div className="text-4xl font-display font-bold text-seal-crimson">{summary.olderCases.value}</div>
            <AlertCircle className="w-5 h-5 text-seal-crimson opacity-50 mb-1" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        
        {/* Line Chart */}
        <div className="bg-paper border border-ink/20 p-6 shadow-sm admin-anim opacity-0" style={prefersReducedMotion ? {opacity: 1} : {}}>
          <h3 className="font-display font-semibold text-lg text-ink mb-6">Disposal Trends (Last 12 Months)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={closedTrends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--slate)" strokeOpacity={0.2} />
                <XAxis dataKey="month" tick={{ fill: 'var(--slate)', fontSize: 12, fontFamily: 'var(--font-ibm-plex-mono)' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: 'var(--slate)', fontSize: 12, fontFamily: 'var(--font-ibm-plex-mono)' }} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--ink)', color: 'var(--paper)', border: 'none', borderRadius: 0 }}
                  itemStyle={{ color: 'var(--paper)' }}
                />
                <Line type="monotone" dataKey="closed" stroke="hsl(var(--sage))" strokeWidth={3} dot={{ fill: 'hsl(var(--sage))', strokeWidth: 2 }} activeDot={{ r: 6 }} isAnimationActive={true} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-paper border border-ink/20 p-6 shadow-sm admin-anim opacity-0" style={prefersReducedMotion ? {opacity: 1} : {}}>
          <h3 className="font-display font-semibold text-lg text-ink mb-6">Avg Pendency by Type</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pendencyByType} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--slate)" strokeOpacity={0.2} />
                <XAxis type="number" tick={{ fill: 'var(--slate)', fontSize: 12, fontFamily: 'var(--font-ibm-plex-mono)' }} tickLine={false} axisLine={false} />
                <YAxis dataKey="caseType" type="category" tick={{ fill: 'var(--ink)', fontSize: 12, textTransform: 'capitalize' }} tickLine={false} axisLine={false} width={80} />
                <Tooltip 
                  cursor={{ fill: 'var(--slate)', opacity: 0.1 }}
                  contentStyle={{ backgroundColor: 'var(--ink)', color: 'var(--paper)', border: 'none', borderRadius: 0 }}
                />
                <Bar dataKey="avgPendency" fill="hsl(var(--verdict-gold))" radius={[0, 4, 4, 0]} isAnimationActive={true} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Donut Chart */}
        <div className="bg-paper border border-ink/20 p-6 shadow-sm lg:col-span-1 flex flex-col admin-anim opacity-0" style={prefersReducedMotion ? {opacity: 1} : {}}>
          <h3 className="font-display font-semibold text-lg text-ink mb-6">Active Case Distribution</h3>
          <div className="h-64 w-full flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                  isAnimationActive={true}
                >
                  {statusDistribution.map((entry, index) => {
                    const cssVar = COLORS[index % COLORS.length].match(/var\(([^)]+)\)/)[1];
                    return <Cell key={`cell-${index}`} fill={`hsl(var(${cssVar}))`} />;
                  })}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--ink)', color: 'var(--paper)', border: 'none', borderRadius: 0 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Custom Legend */}
          <div className="flex flex-wrap gap-3 mt-4">
            {statusDistribution.map((entry, index) => (
              <div key={entry.name} className="flex items-center text-xs font-mono">
                <span className="w-3 h-3 block mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                <span className="text-slate uppercase truncate" title={entry.name}>{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top 10 Stuck Cases */}
        <div className="bg-paper border border-ink/20 shadow-sm lg:col-span-2 overflow-hidden flex flex-col admin-anim opacity-0" style={prefersReducedMotion ? {opacity: 1} : {}}>
          <div className="p-6 border-b border-ink/10 bg-ink text-paper flex justify-between items-center">
            <h3 className="font-display font-semibold text-lg">Top 10 Critical Cases</h3>
            <span className="font-mono text-xs uppercase tracking-widest text-paper/70">Requires Attention</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-ink/10 bg-paper">
                  <th className="p-4 font-mono text-xs uppercase text-slate font-normal">Case No.</th>
                  <th className="p-4 font-mono text-xs uppercase text-slate font-normal">Title</th>
                  <th className="p-4 font-mono text-xs uppercase text-slate font-normal">Status</th>
                  <th className="p-4 font-mono text-xs uppercase text-slate font-normal text-right">Pendency</th>
                </tr>
              </thead>
              <tbody>
                {topStuckCases.map((c, i) => (
                  <tr key={c._id} className="border-b border-ink/5 hover:bg-ink/5 hover:-translate-y-[1px] border hover:border-verdict-gold transition-all duration-200 group interactive">
                    <td className="p-4 font-mono text-sm text-ink whitespace-nowrap">
                      <AnimatedLink href={`/dashboard/staff?caseId=${c._id}`} className="hover:underline text-verdict-gold">
                        {c.caseNumber}
                      </AnimatedLink>
                    </td>
                    <td className="p-4 font-sans text-sm text-ink max-w-[200px] truncate" title={c.title}>
                      {c.title}
                    </td>
                    <td className="p-4 font-mono text-xs uppercase text-slate">
                      {c.status.replace("_", " ")}
                    </td>
                    <td className="p-4 text-right">
                      <span className={`px-2 py-1 text-xs font-mono uppercase ${i < 3 ? 'bg-seal-crimson text-paper' : 'bg-verdict-gold/20 text-ink'}`}>
                        Score {c.pendencyScore}
                      </span>
                    </td>
                  </tr>
                ))}
                {topStuckCases.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-slate font-mono text-sm">No stuck cases found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
      
      {/* Staff Provisioning Section */}
      <div className="mt-8 admin-anim opacity-0" style={prefersReducedMotion ? {opacity: 1} : {}}>
        <StaffManager />
      </div>

    </div>
  );
}
