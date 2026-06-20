"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError("");
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 6) { setError("Must be at least 6 characters"); return; }
    setLoading(true);
    try { await api.post("/api/auth/reset-password", { token, password }); setSuccess(true); }
    catch { setError("Invalid or expired link."); }
    setLoading(false);
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-xl font-bold text-[#202124]">Invalid Link</h1>
          <p className="text-xs text-[#757575] mt-2">Missing reset token.</p>
          <button onClick={() => router.push("/login")} className="mt-4 text-xs text-[#4285F4] hover:underline">Go to Login</button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-14 h-14 bg-[#E6F4EA] rounded-full flex items-center justify-center mx-auto">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0F9D58" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg>
          </div>
          <h1 className="text-xl font-bold text-[#202124] mt-4">Password Reset</h1>
          <p className="text-xs text-[#757575] mt-2">Your password has been updated.</p>
          <button onClick={() => router.push("/login")} className="mt-5 w-full bg-[#4285F4] text-white px-4 py-2.5 rounded-lg font-bold text-xs hover:bg-[#1A73E8]">Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <a href="/" className="text-2xl font-bold tracking-tight"><span className="text-[#4285F4]">Parking</span> <span className="text-[#0F9D58]">Agent</span></a>
          <h1 className="text-xl font-bold text-[#202124] mt-4">Set New Password</h1>
          <p className="text-xs text-[#757575] mt-1">Enter your new password below.</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
          <input type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#4285F4]" required minLength={6} />
          <input type="password" placeholder="Confirm new password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#4285F4]" required minLength={6} />
          {error && <p className="text-xs text-[#E94335]">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-[#4285F4] text-white px-4 py-2.5 rounded-lg font-bold text-xs hover:bg-[#1A73E8] disabled:opacity-50">
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="w-8 h-8 border-4 border-[#E8F0FE] border-t-[#4285F4] rounded-full animate-spin" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
