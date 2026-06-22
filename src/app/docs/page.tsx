"use client";

import { useRouter } from "next/navigation";
import HelpNav from "@/components/HelpNav";

const guides = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    title: "Getting Started",
    text: "Sign up, verify your account, and set up your parking profile.",
    path: "/docs/getting-started",
    color: "from-[#E8F0FE] to-[#D2E3FC]",
    iconColor: "text-[#4285F4]",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: "Schedule Matching",
    text: "Drop a pin, set your times, and get matched for recurring parking.",
    path: "/docs/schedule-matching",
    color: "from-[#E6F4EA] to-[#C8E6C9]",
    iconColor: "text-[#0F9D58]",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Arrival Beacon",
    text: "Need a spot right now? Send a beacon for unscheduled arrivals.",
    path: "/docs/arrival-beacon",
    color: "from-[#FCE8E6] to-[#FFCDD2]",
    iconColor: "text-[#E94335]",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Account Guide",
    text: "Rankings, match history, pre-scheduled connections, and settings.",
    path: "/docs/account-guide",
    color: "from-[#FFF3E0] to-[#FFE0B2]",
    iconColor: "text-[#F9A825]",
  },
];

export default function DocsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      <HelpNav current="docs" />

      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-[#202124]">Documentation</h1>
          <p className="text-[#757575] mt-2">Everything you need to know about using spotimization</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {guides.map((guide) => (
            <button
              key={guide.title}
              onClick={() => router.push(guide.path)}
              className="text-left group"
            >
              <div className={`bg-gradient-to-br ${guide.color} rounded-2xl p-6 border border-gray-200/60 hover:shadow-lg transition-all duration-200`}>
                <div className={`w-14 h-14 rounded-xl bg-white flex items-center justify-center mb-4 shadow-sm ${guide.iconColor}`}>
                  {guide.icon}
                </div>
                <h3 className="text-lg font-bold text-[#202124] mb-1 group-hover:text-[#4285F4] transition-colors">
                  {guide.title}
                </h3>
                <p className="text-sm text-[#757575] leading-relaxed">{guide.text}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-12 bg-gray-50 rounded-2xl p-8 text-center border border-gray-200">
          <h2 className="font-bold text-[#202124] mb-2">Still have questions?</h2>
          <p className="text-sm text-[#757575] mb-4">
            Check the FAQ for quick answers.
          </p>
          <button
            onClick={() => router.push("/help-center")}
            className="bg-[#4285F4] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#1A73E8] transition-colors"
          >
            Help Center
          </button>
        </div>
      </main>
    </div>
  );
}
