"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getStoredUser, clearAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import type { AuthUser } from "@/lib/api";
import { HoverButton } from "@/components/ui/HoverButton";

export default function Home() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [signupCount, setSignupCount] = useState<{ count: number; remaining: number; isFull: boolean } | null>(null);

  useEffect(() => { setUser(getStoredUser()); }, []);

  useEffect(() => {
    api.get<{ count: number; remaining: number; isFull: boolean }>("/api/signup-count").then(setSignupCount).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white relative">
      <div className="fixed inset-0 -z-10 opacity-[0.06] bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1587293852726-70cdb56c2866?q=80&w=2000')" }} />
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
          <motion.a
            href="/"
            className="text-lg font-bold tracking-tight"
            whileHover={{ scale: 1.05 }}
          >
            spotimization
          </motion.a>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-[#757575]">
            <a href="/docs" className="hover:text-[#202124] transition-colors">Docs</a>
            <a href="/how-it-works" className="hover:text-[#202124] transition-colors">How It Works</a>
            <a href="/terms" className="hover:text-[#202124] transition-colors">Terms</a>
            <a href="/guidelines" className="hover:text-[#202124] transition-colors">Guidelines</a>
            {user ? (
              <div className="flex items-center gap-3">
                <a href="/profile" className="text-[#4285F4] hover:underline">Profile</a>
                {user.isAdmin && <a href="/admin" className="text-[#E94335] hover:underline">Admin</a>}
                <button onClick={() => { clearAuth(); setUser(null); }} className="hover:text-[#E94335] transition-colors">Sign Out</button>
              </div>
            ) : (
              <a href="/login" className="bg-[#4285F4] text-white px-4 py-2 rounded-lg hover:bg-[#1A73E8] transition-colors">Login</a>
            )}
          </div>
          <button className="md:hidden text-[#757575]" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? "\u2715" : "\u2630"}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 px-4 py-4 space-y-3 text-sm">
            <a href="/docs" className="block text-[#757575] hover:text-[#202124]">Docs</a>
            <a href="/how-it-works" className="block text-[#757575] hover:text-[#202124]">How It Works</a>
            <a href="/terms" className="block text-[#757575] hover:text-[#202124]">Terms</a>
            <a href="/guidelines" className="block text-[#757575] hover:text-[#202124]">Guidelines</a>
            {user ? (
              <>
                <a href="/profile" className="block text-[#4285F4]">Profile</a>
                <button onClick={() => { clearAuth(); setUser(null); }} className="block text-[#E94335]">Sign Out</button>
              </>
            ) : (
              <a href="/login" className="block text-[#4285F4]">Login</a>
            )}
          </div>
        )}
      </nav>

      {/* Hero */}
      <motion.section
        className="max-w-5xl mx-auto px-4 pt-16 pb-12 text-center"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h1 className="text-4xl md:text-5xl font-black text-[#202124] leading-tight mb-2">
          Would you drive around for 30 minutes if someone paid you $4.99?
        </h1>
      </motion.section>

      {/* Benefits */}
      <section className="max-w-3xl mx-auto px-4 pb-8">
        <div className="bg-gradient-to-r from-[#E8F0FE] to-[#E6F4EA] border border-[#4285F4]/20 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-[#202124] text-center mb-4">Key Benefits</h2>
          <ul className="space-y-3 text-sm text-[#202124]">
            <li className="flex items-center gap-2">{"\u2705"} <span><strong>Free for first 100 users</strong> \u2014 1 year free membership, then $4.99/month</span></li>
            <li className="flex items-center gap-2">{"\u2705"} <span>No money exchanged between members</span></li>
            <li className="flex items-center gap-2">{"\u2705"} <span>Completely anonymous (Member #1234, not your name)</span></li>
          </ul>
        </div>
      </section>

      {/* Signup Counter + CTA */}
      <section className="max-w-3xl mx-auto px-4 pb-16 text-center">
        {signupCount && (
          <p className="text-sm text-[#757575] mb-4">
            Current signups: <strong className="text-[#4285F4]">{signupCount.count}/100</strong>
            {!signupCount.isFull && (
              <span className="text-[#0F9D58]"> \u2014 {signupCount.remaining} free spot{signupCount.remaining !== 1 ? "s" : ""} left!</span>
            )}
          </p>
        )}
        <HoverButton variant="primary" onClick={() => router.push("/signup")}>
          Sign Up for Free
        </HoverButton>
      </section>
    </div>
  );
}
