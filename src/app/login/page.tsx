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
    e.preventDefault();
    setError("");
    setLoading(true);

    const user = await login(email, password);
    if (user) {
      router.push(user.isAdmin ? "/admin" : "/dashboard");
    } else {
      setError("Invalid email or password");
    }
    setLoading(false);
  };

  const quickLogin = async (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
    setLoading(true);
    setError("");
    const user = await login(e, p);
    if (user) {
      router.push(user.isAdmin ? "/admin" : "/dashboard");
    } else {
      setError("Invalid email or password");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <a href="/" className="text-2xl font-bold tracking-tight">
            <span className="text-[#4285F4]">Parking</span>{" "}
            <span className="text-[#0F9D58]">Agent</span>
          </a>
          <p className="text-[#757575] mt-2 text-sm">Sign in to your account</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-3 mb-4">
          <p className="text-xs font-semibold text-[#757575] uppercase tracking-wider">Quick Login</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => quickLogin("admin@parkingagent.com", "admin123")}
              className="text-xs bg-[#4285F4]/10 text-[#4285F4] px-3 py-1.5 rounded-lg hover:bg-[#4285F4]/20 transition-colors">
              Admin
            </button>
            <button onClick={() => quickLogin("test@parkingagent.com", "test123")}
              className="text-xs bg-[#0F9D58]/10 text-[#0F9D58] px-3 py-1.5 rounded-lg hover:bg-[#0F9D58]/20 transition-colors">
              Test Account
            </button>
            <button onClick={() => quickLogin("alice@example.com", "password123")}
              className="text-xs bg-[#FBBC04]/10 text-[#FBBC04] px-3 py-1.5 rounded-lg hover:bg-[#FBBC04]/20 transition-colors">
              Alice (Member)
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          {error && (
            <div className="bg-[#FCE8E6] border border-[#E94335]/30 text-[#E94335] text-sm p-3 rounded-xl">{error}</div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#202124] mb-1">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] outline-none" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#202124] mb-1">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] outline-none" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-[#4285F4] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#1A73E8] transition-colors disabled:opacity-50">
            {loading ? "Signing in..." : "Sign In"}
          </button>
          <p className="text-center text-xs text-[#BDBDBD]">
            Don&apos;t have an account? <a href="/signup" className="text-[#4285F4] hover:underline">Sign up</a>
          </p>
        </form>
      </div>
    </div>
  );
}
