"use client";

import { useRouter } from "next/navigation";
import HelpNav from "@/components/HelpNav";

const steps = [
  {
    num: 1,
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    title: "Sign Up & Verify",
    text: "Create account, verify phone, agree to TOS",
  },
  {
    num: 2,
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Drop a Pin on Your Spot",
    text: "Select exact street parking spot on neighborhood map",
  },
  {
    num: 3,
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Set Your Times",
    text: "Enter arrival time, departure time, and vehicle type",
  },
  {
    num: 4,
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Get Matched",
    text: "We match you with someone arriving or departing at the same time",
  },
  {
    num: 5,
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10m10 0h-3m3 0h3m-8-4h3" />
      </svg>
    ),
    title: "Track in Real-Time",
    text: "Uber-style live tracking shows arriving user's location",
  },
  {
    num: 6,
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Seamless Exchange",
    text: "Arriving user positioned \u2192 departing user starts car \u2192 exchange complete",
  },
];

export default function HowItWorks() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <HelpNav current="how-it-works" />

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="modern-hero px-6 py-10 sm:px-10 sm:py-14 text-center mb-10">
          <div className="relative z-10">
            <h1 className="text-4xl sm:text-5xl font-bold text-white">How It Works</h1>
            <p className="text-white/90 mt-3 text-lg">Six simple steps to a seamless parking exchange</p>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-1 mb-12">
          {steps.map((s) => (
            <div key={s.num} className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#4285F4] text-white flex items-center justify-center text-xs font-bold">
                {s.num}
              </div>
              {s.num < 6 && <div className="w-8 h-0.5 bg-[#4285F4]/30" />}
            </div>
          ))}
        </div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-[#4285F4]/20 hidden md:block" />

          <div className="space-y-10">
            {steps.map((step, idx) => (
              <div key={step.num} className="relative flex items-start gap-6">
                {/* Step number badge */}
                <div className={`flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center z-10 ${
                  idx % 2 === 0 ? "bg-[#E8F0FE] text-[#4285F4]" : "bg-[#E6F4EA] text-[#0F9D58]"
                }`}>
                  {step.icon}
                </div>

                {/* Content */}
                <div className="flex-1 pt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-[#4285F4]">Step {step.num}</span>
                    <span className="text-xs text-[#757575]">of 6</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#202124]">{step.title}</h3>
                  <p className="text-sm text-[#757575] mt-1 leading-relaxed">{step.text}</p>
                </div>

                {/* Mobile step indicator */}
                <div className="md:hidden flex-shrink-0 w-8 h-8 rounded-full bg-[#4285F4] text-white flex items-center justify-center text-xs font-bold">
                  {step.num}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Illustration placeholder */}
        <div className="mt-12 bg-gradient-to-br from-[#E8F0FE] to-[#E6F4EA] rounded-2xl p-8 text-center border border-[#4285F4]/20">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <svg className="w-10 h-10 text-[#4285F4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h3 className="font-bold text-[#202124] mb-2">Ready to find your spot?</h3>
          <p className="text-sm text-[#757575] mb-4">Join hundreds of members optimizing street parking</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-[#4285F4] text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-[#1A73E8] transition-colors"
          >
            Get Started
          </button>
        </div>
      </main>
    </div>
  );
}
