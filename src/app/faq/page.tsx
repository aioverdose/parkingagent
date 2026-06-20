"use client";

import { useState } from "react";

const faqs = [
  {
    q: "What is Parking Agent?",
    a: "Parking Agent is a membership platform that uses AI agentic matching technology to help members find street parking in Long Beach, CA. We connect departing members with arriving members to make parking easier.",
  },
  {
    q: "Does Parking Agent own parking spots?",
    a: "No. Parking Agent does not own, sell, lease, or control any parking spots. We provide matching technology and community education. All parking arrangements are between members.",
  },
  {
    q: "How does the AI matching work?",
    a: "When a member is leaving a spot, our AI searches for the closest good-standing member who needs a spot. It pairs them based on proximity and ranking status, then notifies both members.",
  },
  {
    q: "What is the ranking system?",
    a: "Similar to ride-sharing platforms, members earn ranking points for successful matches and course completion. Higher-ranked members get priority in the matching queue.",
  },
  {
    q: "What does membership cost?",
    a: "Monthly membership ranges from $9.99 to $19.99/month. Annual membership ranges from $79 to $149/year. Membership includes access to matching technology, educational courses, and the community platform.",
  },
  {
    q: "Is there a course requirement?",
    a: "Yes. All members must complete a short course on Long Beach street parking laws, including time limits, permit zones, no-parking zones, and community participation rules.",
  },
  {
    q: "What areas does Parking Agent serve?",
    a: "Parking Agent is currently focused on Long Beach, California. We plan to expand to other cities in the future.",
  },
  {
    q: "How do I become a member?",
    a: "Sign up through our website, complete the required course modules, and your membership will be activated. You can then start using the matching service immediately.",
  },
  {
    q: "What happens if I get a parking ticket?",
    a: "Parking Agent is not responsible for parking tickets or fines. Members are responsible for complying with all local parking laws and regulations. Our educational courses help you understand the rules.",
  },
  {
    q: "How do I cancel my membership?",
    a: "You can cancel your membership at any time through your account settings. Refunds are handled on a case-by-case basis. Contact support@parkingagent.com for assistance.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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
              Join Now
            </a>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl sm:text-4xl font-black text-center text-[#202124]">
          FAQ
        </h1>
        <p className="text-center text-[#757575] mt-2">
          Frequently asked questions about Parking Agent.
        </p>

        <div className="mt-10 space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-[#202124] text-sm">
                  {faq.q}
                </span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className={`shrink-0 text-[#757575] transition-transform ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {openIndex === i && (
                <div className="px-5 pb-4 text-sm text-[#757575] leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-gray-200 py-6 text-center text-xs text-[#BDBDBD]">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; 2026 Parking Agent. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="/premium" className="hover:text-[#4285F4]">Premium</a>
            <a href="/tos" className="hover:text-[#4285F4]">Terms</a>
            <a href="/legal/privacy" className="hover:text-[#4285F4]">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
