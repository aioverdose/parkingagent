"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, clearAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import type { AuthUser } from "@/lib/api";

export default function Home() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const handleSignOut = () => {
    clearAuth();
    setUser(null);
  };

  const handleCheckout = async (priceType: string) => {
    if (!user) {
      router.push("/login");
      return;
    }
    setCheckoutLoading(priceType);
    try {
      const { url } = await api.post<{ url: string }>("/api/stripe/checkout", { priceType });
      window.location.href = url;
    } catch {
      alert("Checkout is not configured yet. Add Stripe keys to enable payments.");
    }
    setCheckoutLoading(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between max-w-5xl mx-auto px-4 py-3">
          <div className="text-xl font-bold tracking-tight">
            <span className="text-[#4285F4]">Parking</span>{" "}
            <span className="text-[#0F9D58]">Agent</span>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden p-2 text-[#757575] hover:text-[#4285F4]"
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <div className="hidden sm:flex items-center gap-6">
            {["How it works", "Membership", "FAQ"].map((label) => (
              <a
                key={label}
                href={label === "How it works" ? "/how-it-works" : label === "Membership" ? "/membership" : "#"}
                className="text-sm font-medium text-[#757575] hover:text-[#4285F4] transition-colors"
              >
                {label}
              </a>
            ))}
            {user ? (
              <>
                <a href="/dashboard" className="text-sm font-medium text-[#0F9D58] hover:text-[#34A853] transition-colors">Dashboard</a>
                <button onClick={handleSignOut}
                  className="text-sm font-medium text-[#E94335] hover:underline">Sign out</button>
              </>
            ) : (
              <>
                <a href="/login" className="text-sm font-medium text-[#757575] hover:text-[#4285F4] transition-colors">Login</a>
                <a href="/signup"
                  className="bg-[#4285F4] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#1A73E8] transition-colors">
                  Get Started
                </a>
              </>
            )}
          </div>
        </div>

        {menuOpen && (
          <div className="sm:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
            {["How it works", "Membership", "FAQ"].map((label) => (
              <a
                key={label}
                href={label === "How it works" ? "/how-it-works" : label === "Membership" ? "/membership" : "#"}
                className="block text-sm font-medium text-[#757575] hover:text-[#4285F4] py-2"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </a>
            ))}
            {user ? (
              <>
                <a href="/dashboard" className="block text-sm font-medium text-[#0F9D58] py-2" onClick={() => setMenuOpen(false)}>Dashboard</a>
                <button onClick={() => { handleSignOut(); setMenuOpen(false); }}
                  className="block text-sm font-medium text-[#E94335] py-2">Sign out</button>
              </>
            ) : (
              <>
                <a href="/login" className="block text-sm font-medium text-[#757575] py-2" onClick={() => setMenuOpen(false)}>Login</a>
                <a href="/signup"
                  className="block text-center bg-[#4285F4] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#1A73E8]"
                  onClick={() => setMenuOpen(false)}>
                  Get Started
                </a>
              </>
            )}
          </div>
        )}
      </nav>

      <main className="flex-1">
        <section className="max-w-5xl mx-auto px-4 pt-20 pb-32 sm:pt-28 sm:pb-40 text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#202124]">
            Parking Agent
          </h1>
          <p className="text-xl sm:text-2xl text-[#757575] mt-4 font-medium">
            City streets parking assistant
          </p>
          <p className="text-base sm:text-lg text-[#4285F4] mt-3 font-semibold">
            Membership has its advantages
          </p>
          <div className="mt-10">
            <a
              href="/how-it-works"
              className="inline-block bg-[#0F9D58] text-white px-8 py-4 rounded-xl text-lg font-bold shadow-lg hover:bg-[#34A853] transition-colors"
            >
              Get Started
            </a>
          </div>
        </section>

        {/* PROBLEMS WE SOLVE */}
        <section className="py-16 sm:py-24 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#4285F4] text-center">Street Parking Chaos, Solved</h2>
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white border border-[#BDBDBD] rounded-lg shadow-sm p-6">
                <div className="text-4xl mb-4">🚗</div>
                <h3 className="text-lg font-bold text-[#202124]">Multi-Car Chaos</h3>
                <p className="mt-2 text-[#757575] text-sm leading-relaxed">When someone posts "leaving soon," 5+ cars race to the same spot. We prevent this.</p>
              </div>
              <div className="bg-white border border-[#BDBDBD] rounded-lg shadow-sm p-6">
                <div className="text-4xl mb-4">⏱️</div>
                <h3 className="text-lg font-bold text-[#202124]">Time Wasted</h3>
                <p className="mt-2 text-[#757575] text-sm leading-relaxed">10–30 minutes per day circling blocks. That's 2+ hours weekly lost.</p>
              </div>
              <div className="bg-white border border-[#BDBDBD] rounded-lg shadow-sm p-6">
                <div className="text-4xl mb-4">📜</div>
                <h3 className="text-lg font-bold text-[#202124]">Parking Tickets</h3>
                <p className="mt-2 text-[#757575] text-sm leading-relaxed">Don't know Long Beach laws? Time limits, permit zones = expensive tickets.</p>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-16 sm:py-24">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#4285F4] text-center">How Parking Agent Works</h2>
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-14 h-14 bg-[#4285F4] rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="mt-6 text-lg font-bold text-[#202124]">Become a Member</h3>
                <p className="mt-2 text-[#757575] text-sm leading-relaxed max-w-xs mx-auto">Complete a short course on Long Beach street parking laws. Get verified.</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-[#4285F4] rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="mt-6 text-lg font-bold text-[#202124]">Request or Offer</h3>
                <p className="mt-2 text-[#757575] text-sm leading-relaxed max-w-xs mx-auto">"I Need a Spot" → AI finds closest deparer. "I'm Leaving" → AI matches you to someone arriving.</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-[#4285F4] rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="mt-6 text-lg font-bold text-[#202124]">Get Matched</h3>
                <p className="mt-2 text-[#757575] text-sm leading-relaxed max-w-xs mx-auto">Only 1 car per spot. You get route map + arrival time. No chaos.</p>
              </div>
            </div>
          </div>
        </section>

        {/* MEMBERSHIP BENEFITS */}
        <section className="py-16 sm:py-24 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#4285F4] text-center">What Members Get</h2>
            <div className="mt-12 max-w-2xl mx-auto space-y-4">
              <div className="flex items-start gap-3 bg-white border border-[#BDBDBD] rounded-lg shadow-sm p-4">
                <span className="text-lg mt-0.5">✅</span>
                <p className="text-[#757575]"><span className="font-bold text-[#202124]">AI Agentic Matching</span> – Uber-style proximity pairing</p>
              </div>
              <div className="flex items-start gap-3 bg-white border border-[#BDBDBD] rounded-lg shadow-sm p-4">
                <span className="text-lg mt-0.5">✅</span>
                <p className="text-[#757575]"><span className="font-bold text-[#202124]">No Multi-Car Chaos</span> – Spots hidden until matched</p>
              </div>
              <div className="flex items-start gap-3 bg-white border border-[#BDBDBD] rounded-lg shadow-sm p-4">
                <span className="text-lg mt-0.5">✅</span>
                <p className="text-[#757575]"><span className="font-bold text-[#202124]">Long Beach Law Course</span> – Avoid tickets</p>
              </div>
              <div className="flex items-start gap-3 bg-white border border-[#BDBDBD] rounded-lg shadow-sm p-4">
                <span className="text-lg mt-0.5">✅</span>
                <p className="text-[#757575]"><span className="font-bold text-[#202124]">Ranking System</span> – Good behavior = priority</p>
              </div>
              <div className="flex items-start gap-3 bg-white border border-[#BDBDBD] rounded-lg shadow-sm p-4">
                <span className="text-lg mt-0.5">✅</span>
                <p className="text-[#757575]"><span className="font-bold text-[#202124]">Route Maps</span> – Exact directions to spot</p>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="py-16 sm:py-24">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#4285F4] text-center">Membership Pricing</h2>
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
              <div className="bg-white border border-[#BDBDBD] rounded-lg shadow-sm p-8 text-center">
                <h3 className="text-xl font-bold text-[#202124]">Monthly</h3>
                <p className="mt-4 text-4xl font-black text-[#202124]">$14.99<span className="text-lg font-medium text-[#757575]">/month</span></p>
                <button onClick={() => handleCheckout("monthly")} disabled={checkoutLoading === "monthly"}
                  className="mt-8 w-full bg-[#0F9D58] text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-[#34A853] transition-colors disabled:opacity-50">
                  {checkoutLoading === "monthly" ? "Redirecting..." : "Get Monthly"}
                </button>
              </div>
              <div className="bg-white border border-[#4285F4] rounded-lg shadow-sm p-8 text-center relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FBBB05] text-[#202124] text-xs font-bold px-3 py-1 rounded-full">Save 33%</div>
                <h3 className="text-xl font-bold text-[#202124]">Annual</h3>
                <p className="mt-4 text-4xl font-black text-[#202124]">$119<span className="text-lg font-medium text-[#757575]">/year</span></p>
                <button onClick={() => handleCheckout("annual")} disabled={checkoutLoading === "annual"}
                  className="mt-8 w-full bg-[#0F9D58] text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-[#34A853] transition-colors disabled:opacity-50">
                  {checkoutLoading === "annual" ? "Redirecting..." : "Get Annual"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 sm:py-24 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#4285F4] text-center">Frequently Asked Questions</h2>
            <div className="mt-12 max-w-2xl mx-auto space-y-4">
              <details className="bg-white border border-[#BDBDBD] rounded-lg shadow-sm p-4 group">
                <summary className="font-bold text-[#202124] cursor-pointer list-none flex items-center justify-between">
                  Is Parking Agent selling parking spots?
                  <svg className="w-5 h-5 text-[#757575] group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                </summary>
                <p className="mt-3 text-[#757575] text-sm leading-relaxed">No. We're a membership platform. Parking arrangements are between members.</p>
              </details>
              <details className="bg-white border border-[#BDBDBD] rounded-lg shadow-sm p-4 group">
                <summary className="font-bold text-[#202124] cursor-pointer list-none flex items-center justify-between">
                  Do I need to complete the course?
                  <svg className="w-5 h-5 text-[#757575] group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                </summary>
                <p className="mt-3 text-[#757575] text-sm leading-relaxed">Yes. All members must complete a short course on Long Beach parking laws.</p>
              </details>
              <details className="bg-white border border-[#BDBDBD] rounded-lg shadow-sm p-4 group">
                <summary className="font-bold text-[#202124] cursor-pointer list-none flex items-center justify-between">
                  Can I cancel my membership?
                  <svg className="w-5 h-5 text-[#757575] group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                </summary>
                <p className="mt-3 text-[#757575] text-sm leading-relaxed">Yes. Monthly members can cancel anytime.</p>
              </details>
            </div>
          </div>
        </section>

        {/* SERVICE AREA MAP */}
        <section className="py-16 sm:py-24">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#4285F4] text-center">Serving Long Beach</h2>
            <p className="mt-4 text-lg sm:text-xl text-[#757575] text-center">AI-powered parking matching across all Long Beach neighborhoods.</p>
            <div className="mt-10 rounded-2xl overflow-hidden border border-gray-200 shadow-sm max-w-3xl mx-auto">
              <iframe
                src="https://maps.google.com/maps?q=Long+Beach,+CA&z=12&output=embed"
                width="100%"
                height="350"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Long Beach service area"
              />
            </div>
          </div>
        </section>

        {/* DOWNLOAD APP */}
        <section className="py-16 sm:py-24">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#4285F4] text-center">Get the App</h2>
            <p className="mt-4 text-lg sm:text-xl text-[#757575] text-center">Install Parking Agent on your phone for quick access to AI matching.</p>
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
              <div className="bg-white border border-[#BDBDBD] rounded-lg shadow-sm p-8 text-center">
                <div className="text-5xl mb-4">📱</div>
                <h3 className="text-lg font-bold text-[#202124]">iOS</h3>
                <p className="mt-2 text-sm text-[#757575] leading-relaxed">Open in Safari, tap Share, then <strong>Add to Home Screen</strong>. It works like a native app.</p>
              </div>
              <div className="bg-white border border-[#BDBDBD] rounded-lg shadow-sm p-8 text-center">
                <div className="text-5xl mb-4">🤖</div>
                <h3 className="text-lg font-bold text-[#202124]">Android</h3>
                <p className="mt-2 text-sm text-[#757575] leading-relaxed">Open in Chrome. You'll see an <strong>Install</strong> prompt. Tap it to add to your home screen.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-16 sm:py-24">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#4285F4]">Stop Wasting Time on Street Parking</h2>
            <p className="mt-4 text-lg sm:text-xl text-[#757575]">Join Parking Agent today. Get matched instantly, no chaos.</p>
            <a href="/signup" className="mt-8 inline-block bg-[#0F9D58] text-white px-10 py-4 rounded-lg text-lg font-bold shadow-lg hover:bg-[#34A853] transition-colors">Get Started – Become a Member</a>
            <p className="mt-4 text-sm text-[#BDBDBD]">First 100 members get 1 month free.</p>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 py-10 text-center text-xs text-[#BDBDBD]">
        <div className="max-w-5xl mx-auto px-4 flex flex-col items-center gap-4">
          <div className="flex gap-4">
            <a href="/legal/terms" className="hover:text-[#4285F4]">Terms</a>
            <a href="/legal/privacy" className="hover:text-[#4285F4]">Privacy</a>
            <a href="/legal/accessibility" className="hover:text-[#4285F4]">Accessibility</a>
          </div>
          <p>&copy; 2026 Parking Agent. Long Beach, CA.</p>
          <p className="max-w-lg">Parking Agent is a membership platform. We do not own, sell, or control parking spots.</p>
        </div>
      </footer>
    </div>
  );
}
