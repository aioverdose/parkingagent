"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";

const steps = [
  { label: "Member Departing", desc: "Leaving a parking spot", icon: "🚗", side: "left" },
  { label: "Spot Offered", desc: "AI registers the availability", icon: "📡", side: "right" },
  { label: "AI Finds Match", desc: "Searches closest ranking member", icon: "🤖", side: "left" },
  { label: "Match Confirmed", desc: "Arriving member notified", icon: "✅", side: "right" },
  { label: "Member Arrives", desc: "Takes the parking spot", icon: "📍", side: "left" },
];

const details = [
  { title: "AI Matching Engine", items: ["Departing member posts their soon-to-be-available spot", "AI searches for ranking members in closest proximity", "Pairs the closest good-standing member to the spot", "No multi-car approach — one member, one spot"] },
  { title: "Long Beach Street Parking Laws", items: ["Time limits: 2 hours in commercial zones", "Permit zones: residential permit parking areas", "No-parking zones: red curbs, fire hydrants, driveways", "Street sweeping schedules must be observed"] },
  { title: "Ranking System", items: ["Earn points for successful matches and course completion", "Higher ranking = priority in the AI matching queue", "Good-standing required to participate in matching", "Violations may result in suspension or reduced ranking"] },
];

export default function HowItWorks() {
  const [visibleStep, setVisibleStep] = useState(0);
  useEffect(() => {
    if (visibleStep < steps.length - 1) { const t = setTimeout(() => setVisibleStep(v => v + 1), 1200); return () => clearTimeout(t); }
  }, [visibleStep]);

  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
          <a href="/" className="text-lg font-bold tracking-tight">Spotimization</a>
          <div className="flex items-center gap-4 text-sm font-medium">
            <a href="/login" className="text-[#757575] hover:text-[#202124] transition-colors">Login</a>
            <a href="/signup" className="bg-[#4285F4] text-white px-4 py-2 rounded-lg hover:bg-[#1A73E8] transition-colors">Get Started</a>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 pt-12 pb-20">
        <h1 className="text-3xl font-black text-center text-[#202124]">How It Works</h1>
        <p className="text-center text-[#757575] mt-2 max-w-2xl mx-auto text-sm">Our AI agentic technology matches departing members with arriving members in real-time — no public listing, no multi-car races.</p>

        {/* Timeline */}
        <div className="mt-16 relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#E8F0FE] -translate-x-1/2 hidden sm:block" />
          <div className="space-y-8 sm:space-y-0">
            {steps.map((s, i) => (
              <div key={s.label} className={`flex items-center gap-4 sm:gap-8 ${i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"} ${i <= visibleStep ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} transition-all duration-500 ease-out`}>
                <div className={`flex-1 ${i % 2 === 0 ? "sm:text-right" : "sm:text-left"}`}>
                  <Card className={`${i <= visibleStep ? "animate-fade-in-up" : ""}`} style={{ animationDelay: `${i * 200}ms` }}>
                    <span className="text-2xl block mb-1">{s.icon}</span>
                    <h3 className="font-bold text-[#202124]">{s.label}</h3>
                    <p className="text-xs text-[#757575] mt-0.5">{s.desc}</p>
                  </Card>
                </div>
                <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-[#4285F4] text-white font-bold text-sm shrink-0 relative z-10">{i + 1}</div>
                <div className="flex-1 hidden sm:block" />
              </div>
            ))}
          </div>
        </div>

        {/* Detail cards */}
        <div className="mt-16 grid md:grid-cols-3 gap-4">
          {details.map((d) => (
            <Card key={d.title}>
              <h2 className="font-bold text-[#202124] text-sm mb-3">{d.title}</h2>
              <ul className="space-y-1.5">
                {d.items.map((item) => (
                  <li key={item} className="text-xs text-[#757575] flex items-start gap-2">
                    <span className="text-[#0F9D58] mt-0.5">•</span> {item}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <a href="/signup" className="inline-block bg-[#0F9D58] text-white px-8 py-3.5 rounded-xl font-bold shadow-lg hover:bg-[#34A853] transition-colors">Become a Member</a>
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
