"use client";

import { useState, useEffect } from "react";

const steps = [
  {
    label: "Member Departing",
    description: "Leaving a parking spot",
    icon: "🚗",
    side: "left",
  },
  {
    label: "Spot Offered",
    description: "AI registers the availability",
    icon: "📡",
    side: "right",
  },
  {
    label: "AI Finds Match",
    description: "Searches closest ranking member",
    icon: "🤖",
    side: "left",
  },
  {
    label: "Match Confirmed",
    description: "Arriving member notified",
    icon: "✅",
    side: "right",
  },
  {
    label: "Member Arrives",
    description: "Takes the parking spot",
    icon: "📍",
    side: "left",
  },
];

export default function HowItWorks() {
  const [visibleStep, setVisibleStep] = useState(0);

  useEffect(() => {
    if (visibleStep < steps.length - 1) {
      const timer = setTimeout(() => setVisibleStep((v) => v + 1), 1200);
      return () => clearTimeout(timer);
    }
  }, [visibleStep]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between max-w-5xl mx-auto px-4 py-3">
          <a href="/" className="text-xl font-bold tracking-tight">
            <span className="text-[#4285F4]">Parking</span>{" "}
            <span className="text-[#0F9D58]">Agent</span>
          </a>
          <div className="flex items-center gap-4">
            <a href="/login" className="text-sm font-medium text-[#757575] hover:text-[#4285F4] transition-colors">Login</a>
            <a
              href="/membership"
              className="bg-[#4285F4] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#1A73E8] transition-colors"
            >
              Become a Member
            </a>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <section className="max-w-5xl mx-auto px-4 pt-12 pb-20">
          <h1 className="text-3xl sm:text-4xl font-black text-center text-[#202124]">
            How It Works
          </h1>
          <p className="text-center text-[#757575] mt-2 max-w-2xl mx-auto">
            Our AI agentic technology matches departing members with arriving
            members in real-time, creating a seamless parking experience.
          </p>

          <div className="mt-16 relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#E8F0FE] -translate-x-1/2 hidden sm:block" />

            <div className="space-y-8 sm:space-y-0">
              {steps.map((step, i) => (
                <div
                  key={step.label}
                  className={`flex items-center gap-4 sm:gap-8 ${
                    i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"
                  } ${
                    i <= visibleStep
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4"
                  } transition-all duration-500 ease-out`}
                >
                  <div
                    className={`flex-1 ${
                      i % 2 === 0 ? "sm:text-right" : "sm:text-left"
                    }`}
                  >
                    <div
                      className={`bg-white border border-gray-200 rounded-2xl p-5 shadow-sm ${
                        i <= visibleStep ? "animate-fade-in-up" : ""
                      }`}
                      style={{ animationDelay: `${i * 200}ms` }}
                    >
                      <div className="text-3xl mb-2">{step.icon}</div>
                      <h3 className="font-bold text-[#202124] text-lg">
                        {step.label}
                      </h3>
                      <p className="text-sm text-[#757575] mt-1">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-[#4285F4] text-white font-bold text-sm shrink-0 relative z-10">
                    {i + 1}
                  </div>

                  <div className="flex-1 hidden sm:block" />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 animate-match-pop">
            <div className="bg-[#E8F0FE] border border-[#4285F4]/20 rounded-2xl p-6 max-w-3xl mx-auto">
              <h2 className="text-xl font-bold text-[#1A73E8] mb-3">
                How the AI Matching Works
              </h2>
              <ol className="space-y-2 text-sm text-[#757575] list-decimal list-inside">
                <li>
                  Departing member posts their soon-to-be-available spot
                </li>
                <li>
                  AI system searches for ranking members in closest proximity
                </li>
                <li>
                  Pairs the closest good-standing member to the spot
                </li>
                <li>
                  No multi-car approach — one member, one spot
                </li>
              </ol>
            </div>
          </div>

          <div className="mt-12 bg-white border border-gray-200 rounded-2xl p-6 max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-[#202124] mb-3">
              Long Beach Street Parking Laws
            </h2>
            <p className="text-sm text-[#757575] mb-4">
              All members must complete a short course on laws governing street
              parking for Long Beach, CA. Key topics include:
            </p>
            <ul className="space-y-2 text-sm text-[#757575] list-disc list-inside">
              <li>
                <strong>Time limits:</strong> Most street parking in Long Beach
                has posted time limits (typically 2 hours in commercial zones).
              </li>
              <li>
                <strong>Permit zones:</strong> Residential permit parking areas
                require a valid permit during restricted hours.
              </li>
              <li>
                <strong>No-parking zones:</strong> Red curbs, fire hydrants,
                driveways, bus stops, and crosswalks are strictly enforced.
              </li>
              <li>
                <strong>Street sweeping:</strong> Posted street sweeping
                schedules must be observed — vehicles may be ticketed or towed.
              </li>
              <li>
                <strong>Rules of participation:</strong> Members agree to follow
                all local parking laws and community guidelines.
              </li>
            </ul>
          </div>

          <div className="mt-12 bg-white border border-gray-200 rounded-2xl p-6 max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-[#202124] mb-3">
              Ranking System
            </h2>
            <p className="text-sm text-[#757575] mb-4">
              Similar to ride-sharing platforms, Parking Agent uses a ranking
              system to ensure reliable matching:
            </p>
            <ul className="space-y-2 text-sm text-[#757575] list-disc list-inside">
              <li>
                Members earn ranking points for successful matches and
                completing course modules
              </li>
              <li>
                Higher-ranking members get priority in the AI matching queue
              </li>
              <li>
                Good-standing status is required to participate in matching
              </li>
              <li>
                Violations of community rules may result in suspension or
                reduced ranking
              </li>
            </ul>
          </div>

          <div className="text-center mt-12">
            <a
              href="/membership"
              className="inline-block bg-[#0F9D58] text-white px-8 py-4 rounded-xl text-lg font-bold shadow-lg hover:bg-[#34A853] transition-colors"
            >
              Become a Member
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 py-6 text-center text-xs text-[#BDBDBD]">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; 2026 Parking Agent. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="/legal/terms" className="hover:text-[#4285F4]">Terms</a>
            <a href="/legal/privacy" className="hover:text-[#4285F4]">Privacy</a>
            <a href="/legal/accessibility" className="hover:text-[#4285F4]">Accessibility</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
