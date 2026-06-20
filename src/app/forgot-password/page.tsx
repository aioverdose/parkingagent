"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    try { await api.post("/api/auth/forgot-password", { email }); setSent(true); }
    catch { setError("Something went wrong."); }
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-14 h-14 bg-[#E6F4EA] rounded-full flex items-center justify-center mx-auto">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0F9D58" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg>
          </div>
          <h1 className="text-xl font-bold text-[#202124] mt-4">Check Your Email</h1>
          <p className="text-xs text-[#757575] mt-2">If an account exists, we sent a password reset link.</p>
          <a href="/login" className="mt-5 inline-block text-xs text-[#4285F4] hover:underline">Back to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <a href="/" className="text-2xl font-bold tracking-tight"><span className="text-[#4285F4]">Parking</span> <span className="text-[#0F9D58]">Agent</span></a>
          <h1 className="text-xl font-bold text-[#202124] mt-4">Forgot Password</h1>
          <p className="text-xs text-[#757575] mt-1">Enter your email and we&apos;ll send a reset link.</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
          <input type="email" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#4285F4]" required />
          {error && <p className="text-xs text-[#E94335]">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-[#4285F4] text-white px-4 py-2.5 rounded-lg font-bold text-xs hover:bg-[#1A73E8] disabled:opacity-50">
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
          <p className="text-center text-[10px]"><a href="/login" className="text-[#4285F4] hover:underline">Back to Login</a></p>
        </form>
      </div>
    </div>
  );
}
