"use client";

import { useRouter } from "next/navigation";
import HelpNav from "@/components/HelpNav";

const faqs = [
  {
    q: "What is the Arrival Beacon?",
    a: "The Arrival Beacon is a one-shot request for a parking spot when you're arriving at an unscheduled time. Unlike Schedule Matching which works on recurring windows, the Beacon sends out an immediate alert to nearby members who might be leaving around the same time.",
  },
  {
    q: "How do I activate it?",
    a: "Go to your profile and scroll to the Arrival Beacon section. Enter your arrival time and press 'Send Beacon'. The app uses your current location to find nearby matches.",
  },
  {
    q: "How does it find matches?",
    a: "The Beacon checks for members with active schedules in your area who are departing around your arrival time. It searches within a radius that expands if no initial match is found.",
  },
  {
    q: "How long does it take?",
    a: "Match results typically come back within a few seconds. If no match is found immediately, you'll see a 'no match' result and can try again with a broader time window.",
  },
  {
    q: "Is it free?",
    a: "Yes. The Arrival Beacon is available to all members at no additional cost.",
  },
  {
    q: "Can I use it multiple times?",
    a: "Yes. You can send as many beacons as you need. Each one is a separate request for your current arrival time and location.",
  },
];

export default function ArrivalBeacon() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <HelpNav current="docs" />

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="modern-hero px-6 py-10 sm:px-10 sm:py-14 text-center mb-10">
          <div className="relative z-10">
            <h1 className="text-4xl sm:text-5xl font-bold text-white">Arrival Beacon</h1>
            <p className="text-white/90 mt-3 text-lg">Find a parking spot on demand</p>
          </div>
        </div>
        <button onClick={() => router.push("/docs")} className="text-sm text-[#4285F4] hover:underline mb-6 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Docs
        </button>

        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-[#FCE8E6] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#E94335]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[#202124]">Arrival Beacon</h1>
          <p className="text-[#757575] mt-2">Find a parking spot on demand</p>
        </div>

        <div className="bg-gradient-to-br from-[#FCE8E6] to-[#FFCDD2] rounded-2xl p-6 border border-[#E94335]/20 mb-10">
          <h2 className="font-bold text-[#202124] mb-2">How It Works</h2>
          <ol className="space-y-2 text-sm text-[#475569]">
            <li className="flex items-start gap-2">
              <span className="font-bold text-[#E94335]">1.</span>
              <span>Enter your arrival time on your profile page.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-[#E94335]">2.</span>
              <span>We send a Beacon to nearby members who might be leaving around that time.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-[#E94335]">3.</span>
              <span>If a match is found, you'll see the details and can proceed with the exchange.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-[#E94335]">4.</span>
              <span>If no match is found, try adjusting your time or using the Schedule Matching feature.</span>
            </li>
          </ol>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#202124]">Frequently Asked Questions</h2>
          {faqs.map((faq) => (
            <div key={faq.q} className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
              <h3 className="font-semibold text-[#202124] text-sm">{faq.q}</h3>
              <p className="text-sm text-[#757575] mt-2 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={() => router.push("/profile")}
            className="bg-[#4285F4] text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-[#1A73E8] transition-colors"
          >
            Send a Beacon
          </button>
        </div>
      </main>
    </div>
  );
}
