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
          <span className="text-[#4285F4]">Parking</span>{" "}
          <span className="text-[#0F9D58]">Agent</span>
        </h1>
        <p className="text-xl mt-3 text-[#757575] max-w-2xl mx-auto">
          City streets parking assistant
        </p>
        <p className="text-base mt-2 text-[#757575] max-w-2xl mx-auto">
          <span className="font-semibold text-[#202124]">The only app that uses Uber-style AI matching</span> to prevent multi-car chaos. One spot, one car, every time.
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

      {/* Problems */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <FadeInUp>
          <h2 className="text-2xl font-bold text-[#202124] text-center mb-8">Problems We Solve</h2>
        </FadeInUp>
        <div className="grid md:grid-cols-3 gap-4">
          {problems.map((p, i) => (
            <FadeInUp key={p.title} delay={i * 0.1}>
              <Tooltip content={
                <div>
                  <p className="font-semibold text-[#202124] mb-1">{p.title}</p>
                  <p className="text-xs leading-relaxed">{p.detail}</p>
                </div>
              }>
                <HoverCard glow className="text-center cursor-pointer">
                  <span className="text-3xl block mb-2">{p.icon}</span>
                  <h3 className="font-bold text-[#202124] text-sm">{p.title}</h3>
                  <p className="text-xs text-[#757575] mt-1">{p.desc}</p>
                </HoverCard>
              </Tooltip>
            </FadeInUp>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-[#FAFAFA] border-y border-gray-100 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <FadeInUp>
            <h2 className="text-2xl font-bold text-[#202124] text-center mb-2">How It Works</h2>
            <p className="text-sm text-[#757575] text-center mb-10 max-w-lg mx-auto">Uber-style proximity pairing: the closest good-standing member gets the spot — no public listing, no multi-car races.</p>
          </FadeInUp>
          <div className="grid md:grid-cols-3 gap-4">
            {steps.map((s, i) => (
              <FadeInUp key={s.num} delay={i * 0.15}>
                <TiltCard className="text-center">
                  <div className="w-10 h-10 bg-[#4285F4]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-[#4285F4] font-bold text-sm">{s.num}</span>
                  </div>
                  {s.icon && <span className="text-2xl block mb-2">{s.icon}</span>}
                  <h3 className="font-bold text-[#202124] text-sm">{s.title}</h3>
                  <p className="text-xs text-[#757575] mt-1">{s.desc}</p>
                </TiltCard>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* Spot Scout Feature */}
      <section className="bg-[#FFF8E1] border-y border-[#FBBB05]/20 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <FadeInUp>
            <div className="text-center mb-8">
              <span className="text-4xl">🕵️</span>
              <h2 className="text-2xl font-bold text-[#202124] mt-2">Spot Scout Mode</h2>
              <p className="text-sm text-[#757575] mt-1 max-w-md mx-auto">
                Passengers in the car can join as scouts who anchor open parking spots they see while traveling.
              </p>
            </div>
          </FadeInUp>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: "📍", title: "Anchor Spots", desc: "See an open spot? Tap to anchor it. GPS logs the exact location." },
              { icon: "🎯", title: "Match with Miners", desc: "System finds nearby members looking for a spot and sends them a notification." },
              { icon: "🏆", title: "Earn Rewards", desc: "Successful parks earn points, levels, badges, and ranking boosts." },
            ].map((f, i) => (
              <FadeInUp key={f.title} delay={i * 0.1}>
                <TiltCard className="text-center">
                  <div className="text-3xl mb-2">{f.icon}</div>
                  <h3 className="font-bold text-[#202124] text-sm">{f.title}</h3>
                  <p className="text-xs text-[#757575] mt-1">{f.desc}</p>
                </TiltCard>
              </FadeInUp>
            ))}
          </div>
          <FadeInUp delay={0.3}>
            <div className="text-center mt-8">
              <a href="/signup"
                className="inline-block bg-gradient-to-r from-[#F9A825] to-[#FBBB05] text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all">
                🕵️ Start Scouting
              </a>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* Comparison */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <FadeInUp>
          <h2 className="text-2xl font-bold text-[#202124] text-center mb-8">Why Parking Agent?</h2>
        </FadeInUp>
        <div className="grid md:grid-cols-2 gap-6">
          <FadeInUp delay={0.1}>
            <TiltCard className="border-[#E94335]/30">
              <h3 className="font-bold text-[#E94335] text-base mb-3">🚫 Other Apps</h3>
              <ul className="space-y-2 text-sm text-[#757575]">
                <li className="flex items-start gap-2">✕ <span><strong>Public map of spots</strong> — everyone sees the same spots simultaneously</span></li>
                <li className="flex items-start gap-2">✕ <span><strong>Multi-car races</strong> — 5+ drivers speed to the same spot, first one wins</span></li>
                <li className="flex items-start gap-2">✕ <span><strong>Wasted time</strong> — arrive and find the spot already taken by someone else</span></li>
                <li className="flex items-start gap-2">✕ <span><strong>No accountability</strong> — no ranking system, no behavior tracking</span></li>
              </ul>
            </TiltCard>
          </FadeInUp>
          <FadeInUp delay={0.2}>
            <TiltCard className="border-[#0F9D58]/30">
              <h3 className="font-bold text-[#0F9D58] text-base mb-3">✅ Parking Agent</h3>
              <ul className="space-y-2 text-sm text-[#757575]">
                <li className="flex items-start gap-2">✓ <span><strong>Hidden until matched</strong> — spots are invisible until AI creates a 1-to-1 match</span></li>
                <li className="flex items-start gap-2">✓ <span><strong>One car per spot</strong> — match is exclusive, no other driver can see or claim it</span></li>
                <li className="flex items-start gap-2">✓ <span><strong>Proximity-based pairing</strong> — closest good-standing member gets matched first</span></li>
                <li className="flex items-start gap-2">✓ <span><strong>Uber-style ranking</strong> — good-standing members get priority matching</span></li>
              </ul>
            </TiltCard>
          </FadeInUp>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-[#FAFAFA] border-y border-gray-100 py-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <FadeInUp>
            <h2 className="text-2xl font-bold text-[#202124] mb-2">Simple Pricing</h2>
            <p className="text-sm text-[#757575] mb-8">No hidden fees. No long-term contracts.</p>
          </FadeInUp>
          <div className="grid md:grid-cols-2 gap-6 max-w-xl mx-auto">
            <FadeInUp delay={0.1}>
              <TiltCard className="text-center">
                <h3 className="font-bold text-[#202124] text-lg">Monthly</h3>
                <p className="text-3xl font-black text-[#4285F4] mt-2">$14.99</p>
                <p className="text-xs text-[#757575] mt-1">per month</p>
                <ul className="mt-4 space-y-1.5 text-sm text-[#757575]">
                  <li>✓ AI proximity matching</li>
                  <li>✓ Course modules</li>
                  <li>✓ Ranking system</li>
                  <li>✓ Route maps</li>
                </ul>
                <HoverButton variant="primary" onClick={() => handleCheckout("monthly")} disabled={!!checkoutLoading} className="mt-5 w-full">
                  {checkoutLoading === "monthly" ? "Loading..." : "Start Monthly"}
                </HoverButton>
              </TiltCard>
            </FadeInUp>
            <FadeInUp delay={0.2}>
              <TiltCard className="text-center border-[#4285F4]/30 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0F9D58] text-white text-xs font-bold px-3 py-1 rounded-full">Best Value</div>
                <h3 className="font-bold text-[#202124] text-lg">Annual</h3>
                <p className="text-3xl font-black text-[#0F9D58] mt-2">$119</p>
                <p className="text-xs text-[#757575] mt-1">$9.92/month — save 33%</p>
                <ul className="mt-4 space-y-1.5 text-sm text-[#757575]">
                  <li>✓ Everything in Monthly</li>
                  <li>✓ Priority matching</li>
                  <li>✓ Early access to new cities</li>
                  <li>✓ Cancel anytime</li>
                </ul>
                <HoverButton variant="success" onClick={() => handleCheckout("annual")} disabled={!!checkoutLoading} className="mt-5 w-full">
                  {checkoutLoading === "annual" ? "Loading..." : "Start Annual"}
                </HoverButton>
              </TiltCard>
            </FadeInUp>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <FadeInUp>
          <h2 className="text-2xl font-bold text-[#202124] text-center mb-8">Frequently Asked Questions</h2>
        </FadeInUp>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <FadeInUp key={i} delay={i * 0.05}>
              <motion.div
                className="border border-gray-200 rounded-xl overflow-hidden"
                whileHover={{ boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
              >
                <button onClick={() => setFaqOpen(faqOpen === i ? null : i)} className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                  <span className="font-medium text-[#202124] text-sm">{faq.q}</span>
                  <span className={`text-[#757575] transition-transform ${faqOpen === i ? "rotate-180" : ""}`}>▾</span>
                </button>
                {faqOpen === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="px-5 pb-4 text-sm text-[#757575] leading-relaxed"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </motion.div>
            </FadeInUp>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <motion.section
        className="bg-[#4285F4] py-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-white">Ready to never race for parking again?</h2>
          <p className="text-white/80 mt-3 text-lg">Join Parking Agent and get Uber-style AI matching for street parking.</p>
          <motion.a
            href="/signup"
            className="inline-block bg-white text-[#4285F4] hover:bg-gray-100 mt-6 px-8 py-3 text-base font-bold rounded-xl"
            whileHover={{ scale: 1.05, boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}
            whileTap={{ scale: 0.97 }}
          >
            Get Started
          </motion.a>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#757575]">
          <div className="font-bold tracking-tight">
            <span className="text-[#4285F4]">Parking</span> <span className="text-[#0F9D58]">Agent</span>
          </div>
          <div className="flex gap-4">
            <a href="/scout" className="hover:text-[#202124]">Spot Scout</a>
            <a href="/premium" className="hover:text-[#202124]">Premium</a>
            <a href="/profile" className="hover:text-[#202124]">Free Schedule Matching</a>
            <a href="/tos" className="hover:text-[#202124]">Terms of Service</a>
            <a href="/legal/privacy" className="hover:text-[#202124]">Privacy</a>
            <a href="/legal/accessibility" className="hover:text-[#202124]">Accessibility</a>
            <a href="/faq" className="hover:text-[#202124]">FAQ</a>
          </div>
          <p>© 2026 Parking Agent. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
