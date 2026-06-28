"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser } from "@/lib/auth";
import { api } from "@/lib/api";
import type { AuthUser } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function Membership() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  useEffect(() => { setUser(getStoredUser()); }, []);

  const handleCheckout = async (priceType: string) => {
    if (!user) { router.push("/signup"); return; }
    setCheckoutLoading(priceType);
    try {
      const { url } = await api.post<{ url: string }>("/api/stripe/checkout", { priceType });
      window.location.href = url;
    } catch { alert("Stripe not configured yet."); }
    setCheckoutLoading(null);
  };

  const benefits = [
    { title: "AI Matching", desc: "Real-time AI pairs departing with arriving members for seamless transitions." },
    { title: "Parking Course", desc: "Comprehensive course on local street parking laws, permits, and rules." },
    { title: "Ranking System", desc: "Earn ranking points for priority matching — higher rank means first in queue." },
    { title: "Community Rules", desc: "Clear participation guidelines to maintain good-standing status." },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
          <a href="/" className="text-lg font-bold tracking-tight">Spotimization</a>
          <div className="flex items-center gap-4 text-sm font-medium">
            <a href="/login" className="text-[#757575] hover:text-[#202124] transition-colors">Login</a>
            <a href="/signup" className="bg-[#4285F4] text-white px-4 py-2 rounded-lg hover:bg-[#1A73E8] transition-colors">Start Membership</a>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 pt-12 pb-20">
        <div className="modern-hero px-6 py-10 sm:px-10 sm:py-14 text-center mb-10">
          <div className="relative z-10">
            <h1 className="text-4xl sm:text-5xl font-bold text-white">Membership</h1>
            <p className="text-white/90 mt-3 text-lg">Join Spotimization and unlock AI-powered parking matching in your city.</p>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-10 grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {benefits.map((b) => (
            <Card key={b.title} hover>
              <h3 className="font-bold text-[#202124] text-sm">{b.title}</h3>
              <p className="text-xs text-[#757575] mt-1">{b.desc}</p>
            </Card>
          ))}
        </div>

        {/* Pricing */}
        <div className="mt-14 max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-[#202124] mb-8">Simple Pricing</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <Card className="text-center" hover>
              <h3 className="font-semibold text-[#757575] text-sm">Monthly</h3>
              <p className="text-4xl font-black text-[#4285F4] mt-3">$4.99</p>
              <p className="text-xs text-[#757575] mt-1">per month</p>
              <ul className="mt-5 space-y-2 text-xs text-left">
                {["AI matching technology", "Parking laws course", "Community participation", "Ranking system access"].map((item) => (
                  <li key={item} className="flex items-center gap-2"><span className="text-[#0F9D58]">✓</span> {item}</li>
                ))}
              </ul>
              <Button onClick={() => handleCheckout("monthly")} disabled={!!checkoutLoading} className="mt-6 w-full">
                {checkoutLoading === "monthly" ? "..." : "Start Monthly"}
              </Button>
            </Card>
            <Card className="text-center border-[#4285F4]/30 relative" hover>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0F9D58] text-white text-xs font-bold px-3 py-1 rounded-full">Best Value</div>
              <h3 className="font-semibold text-[#757575] text-sm">Annual</h3>
              <p className="text-4xl font-black text-[#0F9D58] mt-3">$49.99</p>
              <p className="text-xs text-[#757575] mt-1">$4.17/month — save 16%</p>
              <ul className="mt-5 space-y-2 text-xs text-left">
                {["Everything in Monthly", "Priority AI matching", "Early access to new cities", "Cancel anytime"].map((item) => (
                  <li key={item} className="flex items-center gap-2"><span className="text-[#0F9D58]">✓</span> {item}</li>
                ))}
              </ul>
              <Button variant="success" onClick={() => handleCheckout("annual")} disabled={!!checkoutLoading} className="mt-6 w-full">
                {checkoutLoading === "annual" ? "..." : "Start Annual"}
              </Button>
            </Card>
          </div>
        </div>

        {/* Disclosure */}
        <div className="mt-14 bg-[#E8F0FE] border border-[#4285F4]/20 rounded-xl p-5 max-w-3xl mx-auto">
          <h2 className="font-bold text-[#1A73E8] text-sm mb-1">Membership Disclosure</h2>
          <p className="text-xs text-[#757575] leading-relaxed">Spotimization is a membership platform. We do not own, sell, lease, or control any parking spots. Our technology provides AI agentic matching between members. All parking arrangements are between members themselves. Membership fees cover access to our matching technology, educational courses, and community platform.</p>
        </div>
      </main>

      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#757575]">
          <div className="font-bold tracking-tight">Spotimization</div>
          <div className="flex gap-4">
            <a href="/premium" className="hover:text-[#202124]">Premium</a>
            <a href="/tos" className="hover:text-[#202124]">Terms</a>
            <a href="/legal/privacy" className="hover:text-[#202124]">Privacy</a>
          </div>
          <p>© 2026 Spotimization. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
