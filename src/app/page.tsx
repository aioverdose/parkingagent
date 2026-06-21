"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getStoredUser, clearAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import type { AuthUser } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Tooltip } from "@/components/ui/Tooltip";
import { HoverCard } from "@/components/ui/HoverCard";
import { TiltCard } from "@/components/ui/TiltCard";
import { HoverButton } from "@/components/ui/HoverButton";

const problems = [
  { icon: "🚗", title: "Multi-Car Chaos", desc: "5+ cars race to the same spot when publicly listed. Parking Agent hides spots until matched — only 1 car gets it.", detail: "Other apps show public maps of available spots, creating a free-for-all where multiple drivers race to the same location. Our Uber-style matching assigns spots 1-to-1, eliminating multi-car races entirely." },
  { icon: "⏱", title: "Time Wasted", desc: "Drivers circle blocks for 15+ minutes. Our AI matches you to a spot before you arrive.", detail: "Studies show the average driver spends 17 minutes circling for street parking. Parking Agent's proximity-based matching connects you to a departing member nearby, so you go straight to the spot." },
  { icon: "📋", title: "Parking Tickets", desc: "Confusing zone rules cause $50+ citations. Our course covers all LB parking laws.", detail: "Long Beach has complex parking regulations: permit zones, street sweeping schedules, time limits, and no-parking areas. Our required course module covers every rule so you never get blindsided by a ticket." },
];

const steps = [
  { num: "1", title: "Become a Member", desc: "Complete the course and activate your monthly or annual membership." },
  { num: "2", title: "Offer or Request", desc: "Leaving? Post your spot. Need one? Request a match. AI handles the rest.", icon: "🔄" },
  { num: "3", title: "Get Matched 1-to-1", desc: "Our AI pairs you with the closest good-standing member. No public listing, no chaos.", icon: "🤝" },
];

function FadeInUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [signupCount, setSignupCount] = useState<{ count: number; remaining: number; isFull: boolean } | null>(null);

  useEffect(() => { setUser(getStoredUser()); }, []);

  useEffect(() => {
    api.get<{ count: number; remaining: number; isFull: boolean }>("/api/signup-count").then(setSignupCount).catch(() => {});
  }, []);

  const handleCheckout = async (priceType: string) => {
    if (!user) { router.push("/signup"); return; }
    setCheckoutLoading(priceType);
    try {
      const { url } = await api.post<{ url: string }>("/api/stripe/checkout", { priceType });
      window.location.href = url;
    } catch { alert("Stripe not configured yet."); }
    setCheckoutLoading(null);
  };

  const faqs = [
    { q: "How does Parking Agent prevent multi-car chaos?", a: "Unlike other apps that show available spots on a public map (creating a free-for-all race), Parking Agent hides all spots until a match is created. When you request a spot, our AI pairs you 1-to-1 with the closest departing member. Only you get the spot location — no other drivers can see it." },
    { q: "How does the AI matching work?", a: "Our proximity-based algorithm finds the closest good-standing member who is vacating a spot. It considers: (1) distance — the closer member gets priority, (2) ranking score — members with higher scores match first, (3) availability — only active, verified members in good standing." },
    { q: "What does the membership cost?", a: "Monthly plans start at $14.99/month and annual plans at $119/year (save 33%). Both include full access to AI matching, course modules, route maps, and ranking system." },
    { q: "What are the course modules?", a: "Three required modules: Long Beach Street Parking Laws (time limits, zones, rules), Rules of Participation (community guidelines), and Ranking System Overview (how scoring works). Completing all three activates your membership." },
    { q: "What areas are covered?", a: "Currently serving all residential and commercial street parking zones within Long Beach, CA. We're expanding to nearby cities — join the waitlist to get notified." },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
          <motion.a
            href="/"
            className="text-lg font-bold tracking-tight"
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-[#4285F4]">Parking</span>{" "}
            <span className="text-[#0F9D58]">Agent</span>
          </motion.a>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-[#757575]">
            <a href="/how-it-works" className="hover:text-[#202124] transition-colors">How It Works</a>
            <a href="/membership" className="hover:text-[#202124] transition-colors">Pricing</a>
            <a href="/faq" className="hover:text-[#202124] transition-colors">FAQ</a>
            {user ? (
              <div className="flex items-center gap-3">
                <a href="/dashboard" className="text-[#4285F4] hover:underline">Dashboard</a>
                {user.isAdmin && <a href="/admin" className="text-[#E94335] hover:underline">Admin</a>}
                <button onClick={() => { clearAuth(); setUser(null); }} className="hover:text-[#E94335] transition-colors">Sign Out</button>
              </div>
            ) : (
              <a href="/login" className="bg-[#4285F4] text-white px-4 py-2 rounded-lg hover:bg-[#1A73E8] transition-colors">Login</a>
            )}
          </div>
          <button className="md:hidden text-[#757575]" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 px-4 py-4 space-y-3 text-sm">
            <a href="/how-it-works" className="block text-[#757575] hover:text-[#202124]">How It Works</a>
            <a href="/membership" className="block text-[#757575] hover:text-[#202124]">Pricing</a>
            <a href="/faq" className="block text-[#757575] hover:text-[#202124]">FAQ</a>
            {user ? (
              <>
                <a href="/dashboard" className="block text-[#4285F4]">Dashboard</a>
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
        className="max-w-6xl mx-auto px-4 pt-16 pb-16 text-center"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          className="inline-flex items-center gap-2 bg-[#E8F0FE] text-[#4285F4] text-xs font-semibold px-3 py-1.5 rounded-full mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <span>🚀</span> EARLY ACCESS: First 100 Users Get FREE Forever!
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-black text-[#202124] leading-tight">
          Street Parking
        </h1>
        <p className="text-xl mt-3 text-[#757575] max-w-2xl mx-auto">
          Assist
        </p>

        {/* First 100 Free Counter */}
        <div className="mt-8 max-w-lg mx-auto bg-gradient-to-r from-[#E8F0FE] to-[#E6F4EA] border border-[#4285F4]/20 rounded-2xl p-6 text-center">
          {signupCount ? (
            signupCount.isFull ? (
              <>
                <div className="text-3xl mb-2">🎉</div>
                <h2 className="text-lg font-bold text-[#202124]">We've reached 100 users!</h2>
                <p className="text-sm text-[#757575] mt-2">
                  The first 100 got <strong>FREE forever</strong> access.<br />
                  New users: <strong>$4.99/month</strong> for unlimited schedule matching + premium features.
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-black text-[#4285F4]">{signupCount.remaining}</div>
                <p className="text-xs text-[#757575] mt-1">FREE spots remaining</p>
                <div className="mt-3 w-full bg-white/60 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#4285F4] to-[#0F9D58] h-full rounded-full transition-all duration-500" style={{ width: `${(signupCount.count / 100) * 100}%` }} />
                </div>
                <p className="text-xs text-[#757575] mt-2">
                  <strong>{signupCount.count}</strong> of 100 signed up —{" "}
                  {signupCount.count < 100 ? "FREE forever" : "spots filled!"}
                </p>
                <p className="text-xs text-[#0F9D58] font-semibold mt-1">
                  ✅ Unlimited schedule matching · Free forever · Early Adopter badge
                </p>
              </>
            )
          ) : (
            <div className="w-6 h-6 border-2 border-[#4285F4] border-t-transparent rounded-full animate-spin mx-auto" />
          )}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <HoverButton variant="primary" onClick={() => router.push("/signup")}>
            {signupCount?.isFull ? "Sign Up at $4.99/month" : "Join for Free Now"}
          </HoverButton>
          <HoverButton variant="secondary" onClick={() => router.push("/how-it-works")}>
            How It Works →
          </HoverButton>
        </div>
      </motion.section>
    </div>
  );
}
