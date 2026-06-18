"use client";

import { useState } from "react";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

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
            {["How it works", "Membership", "FAQ", "Support"].map((label) => (
              <a
                key={label}
                href={label === "How it works" ? "/how-it-works" : label === "Membership" ? "/membership" : "#"}
                className="text-sm font-medium text-[#757575] hover:text-[#4285F4] transition-colors"
              >
                {label}
              </a>
            ))}
            <a
              href="/how-it-works"
              className="bg-[#4285F4] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#1A73E8] transition-colors"
            >
              Get Started
            </a>
          </div>
        </div>

        {menuOpen && (
          <div className="sm:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
            {["How it works", "Membership", "FAQ", "Support"].map((label) => (
              <a
                key={label}
                href={label === "How it works" ? "/how-it-works" : label === "Membership" ? "/membership" : "#"}
                className="block text-sm font-medium text-[#757575] hover:text-[#4285F4] py-2"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </a>
            ))}
            <a
              href="/how-it-works"
              className="block text-center bg-[#4285F4] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#1A73E8]"
              onClick={() => setMenuOpen(false)}
            >
              Get Started
            </a>
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
