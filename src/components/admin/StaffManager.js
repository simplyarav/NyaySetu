"use client";

import { useState } from "react";
import MagneticButton from "@/components/ui/MagneticButton";

export default function StaffManager() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "clerk"
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create staff account");
      }

      setMessage({ text: "Staff account successfully created!", type: "success" });
      setFormData({ name: "", email: "", password: "", role: "clerk" });
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-paper border border-ink/20 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-ink/10 bg-ink text-paper flex justify-between items-center">
        <h3 className="font-display font-semibold text-lg">Staff Provisioning</h3>
        <span className="font-mono text-xs uppercase tracking-widest text-paper/70">Secure</span>
      </div>
      
      <div className="p-6">
        {message.text && (
          <div className={`p-4 mb-6 font-mono text-sm ${message.type === 'success' ? 'bg-sage/10 text-sage border border-sage' : 'bg-seal-crimson/10 text-seal-crimson border border-seal-crimson'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block font-mono text-xs text-slate uppercase tracking-wider">Full Name</label>
              <input 
                type="text" 
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-paper border border-slate/40 px-4 py-3 text-ink focus:border-ink focus:ring-1 focus:ring-ink transition-colors focus:outline-none"
                placeholder="Staff Member Name"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block font-mono text-xs text-slate uppercase tracking-wider">Role</label>
              <div className="relative">
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full bg-paper border border-slate/40 px-4 py-3 text-ink focus:border-ink focus:ring-1 focus:ring-ink transition-colors focus:outline-none appearance-none font-sans"
                >
                  <option value="clerk">Court Clerk</option>
                  <option value="judge">Honorable Judge</option>
                  <option value="admin">System Admin</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block font-mono text-xs text-slate uppercase tracking-wider">Email Address (Official)</label>
              <input 
                type="email" 
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-paper border border-slate/40 px-4 py-3 text-ink focus:border-ink focus:ring-1 focus:ring-ink transition-colors focus:outline-none"
                placeholder="name@nyaysahayak.gov"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-mono text-xs text-slate uppercase tracking-wider">Temporary Password</label>
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
          </div>

          <div className="pt-2">
            <MagneticButton
              type="submit" 
              disabled={loading}
              className="bg-ink text-paper font-mono uppercase tracking-widest text-sm px-8 py-4 hover:bg-ink/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Provisioning..." : "Provision Staff Account"}
            </MagneticButton>
          </div>
        </form>
      </div>
    </div>
  );
}
