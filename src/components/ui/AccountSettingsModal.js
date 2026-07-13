"use client";

import { useState } from "react";
import MagneticButton from "@/components/ui/MagneticButton";

export default function AccountSettingsModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      setMessage({ text: "Password successfully updated!", type: "success" });
      setFormData({ currentPassword: "", newPassword: "" });
      
      // Auto close after 2 seconds on success
      setTimeout(() => {
        onClose();
        setMessage({ text: "", type: "" });
      }, 2000);
      
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-ink/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-paper border border-ink/20 shadow-[8px_8px_0px_rgba(11,13,16,1)] max-w-md w-full p-8">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate hover:text-ink transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-6">
          <h2 className="font-display font-bold text-2xl text-ink">Account Settings</h2>
          <p className="font-mono text-xs text-slate uppercase tracking-widest mt-1">Security</p>
        </div>

        <div className="hairline-rule mb-6" />

        {message.text && (
          <div className={`p-4 mb-6 font-mono text-sm ${message.type === 'success' ? 'bg-sage/10 text-sage border border-sage' : 'bg-seal-crimson/10 text-seal-crimson border border-seal-crimson'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block font-mono text-xs text-slate uppercase tracking-wider">Current Password</label>
            <input 
              type="password" 
              name="currentPassword"
              required
              value={formData.currentPassword}
              onChange={handleChange}
              className="w-full bg-paper border border-slate/40 px-4 py-3 text-ink focus:border-ink focus:ring-1 focus:ring-ink transition-colors focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-2">
            <label className="block font-mono text-xs text-slate uppercase tracking-wider">New Password</label>
            <input 
              type="password" 
              name="newPassword"
              required
              minLength={8}
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full bg-paper border border-slate/40 px-4 py-3 text-ink focus:border-ink focus:ring-1 focus:ring-ink transition-colors focus:outline-none"
              placeholder="••••••••"
            />
            <p className="text-xs text-slate mt-1">Must be at least 8 characters.</p>
          </div>

          <div className="pt-4">
            <MagneticButton
              type="submit" 
              disabled={loading}
              className="w-full bg-ink text-paper font-mono uppercase tracking-widest text-sm py-4 hover:bg-ink/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Password"}
            </MagneticButton>
          </div>
        </form>
      </div>
    </div>
  );
}
