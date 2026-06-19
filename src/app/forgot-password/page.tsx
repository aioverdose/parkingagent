"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/api/auth/forgot-password", { email });
      setSent(true);
    } catch {
      setError("Something went wrong. Try again.");
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 bg-[#E6F4EA] rounded-full flex items-center justify-center mx-auto">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0F9D58" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <path d="M22 4L12 14.01l-3-3" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#202124] mt-4">Check Your Email</h1>
          <p className="text-[#757575] mt-2">If an account exists with that email, we&apos;ve sent a password reset link.</p>
          <a href="/login" className="mt-6 inline-block text-[#4285F4] hover:underline text-sm">Back to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#202124]">Forgot Password</h1>
          <p className="text-[#757575] mt-2">Enter your email and we&apos;ll send you a reset link.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4] focus:border-transparent"
            required
          />
          {error && <p className="text-sm text-[#E94335]">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4285F4] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#1A73E8] transition-colors disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
          <p className="text-center text-sm">
            <a href="/login" className="text-[#4285F4] hover:underline">Back to Login</a>
          </p>
        </form>
      </div>
    </div>
  );
}
