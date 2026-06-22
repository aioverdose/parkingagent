"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    const user = await login(email, password);
    if (user) { router.push(user.isAdmin ? "/admin" : "/dashboard"); }
    else { setError("Invalid email or password"); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <a href="/" className="text-2xl font-bold tracking-tight">spotimization</a>
          <p className="text-[#757575] mt-1 text-xs">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
          {error && <div className="bg-[#FCE8E6] border border-[#E94335]/30 text-[#E94335] text-xs p-2.5 rounded-lg">{error}</div>}
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-[#202124] mb-1">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#4285F4] outline-none" />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs font-medium text-[#202124] mb-1">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#4285F4] outline-none" />
            <div className="text-right mt-1"><a href="/forgot-password" className="text-[10px] text-[#4285F4] hover:underline">Forgot password?</a></div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-[#4285F4] text-white px-4 py-2.5 rounded-lg font-bold text-xs hover:bg-[#1A73E8] transition-colors disabled:opacity-50">
            {loading ? "Signing in..." : "Sign In"}
          </button>
          <p className="text-center text-[10px] text-[#BDBDBD]">Don't have an account? <a href="/signup" className="text-[#4285F4] hover:underline">Sign up</a></p>
        </form>
      </div>
    </div>
  );
}
