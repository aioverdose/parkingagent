"use client";

import { useRouter } from "next/navigation";
import HelpNav from "@/components/HelpNav";

const sections = [
  {
    id: "before",
    title: "Before Your Exchange",
    icon: "📋",
    color: "text-[#4285F4]",
    bg: "bg-[#E8F0FE]",
    items: [
      { text: "Verify other user's profile and ratings", important: false },
      { text: "Check vehicle type matches your spot", important: false },
      { text: "Confirm arrival and departure times work for both", important: false },
      { text: "Review spot location on map carefully", important: false },
    ],
  },
  {
    id: "during",
    title: "During Your Exchange",
    icon: "🔄",
    color: "text-[#F9AB00]",
    bg: "bg-[#FEF7E0]",
    items: [
      { text: "Arriving user: Position yourself at spot before departing user starts car", important: false },
      { text: "Departing user: Don't start car until arriving user is positioned (geofence confirmed)", important: true },
      { text: "Use live tracking to monitor approaching user", important: false },
      { text: "Keep phone charged and notifications on", important: false },
      { text: "Stay in visible, well-lit areas", important: false },
    ],
  },
  {
    id: "after",
    title: "After Your Exchange",
    icon: "✅",
    color: "text-[#0F9D58]",
    bg: "bg-[#E6F4EA]",
    items: [
      { text: "Rate the other user (helps build trust community)", important: false },
      { text: "Report any issues immediately", important: false },
      { text: "Save the spot if you want to use it again", important: false },
    ],
  },
];

const warnings = [
  "All exchanges are between verified members only",
  "Never share personal information outside app",
  "Park legally - no double or triple parking",
  "If you feel unsafe, cancel the match",
  "Contact support for emergencies",
];

export default function SafetyTips() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      <HelpNav current="safety-tips" />

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-[#E8F0FE] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-[#4285F4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[#202124]">Safety Tips for Parking Exchanges</h1>
          <p className="text-[#757575] mt-2">Best practices for safe and secure parking spot exchanges</p>
        </div>

        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.id} className="border border-gray-200 rounded-2xl overflow-hidden">
              <div className={`${section.bg} px-6 py-4 flex items-center gap-3`}>
                <span className="text-xl">{section.icon}</span>
                <h2 className={`font-bold text-lg ${section.color}`}>{section.title}</h2>
              </div>
              <div className="px-6 py-5 space-y-3">
                {section.items.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    {item.important ? (
                      <svg className="w-5 h-5 text-[#E94335] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-[#0F9D58] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    <span className="text-sm text-[#202124]">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Warnings */}
        <div className="mt-8 bg-[#FFF8E1] border border-[#F9AB00]/40 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-[#F9AB00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h2 className="font-bold text-[#F9AB00]">Important Reminders</h2>
          </div>
          <div className="space-y-3">
            {warnings.map((w, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="text-[#F9AB00] font-bold flex-shrink-0">⚠️</span>
                <span className="text-sm text-[#202124]">{w}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency */}
        <div className="mt-8 text-center border-t border-gray-200 pt-8">
          <p className="text-sm text-[#757575] mb-4">For urgent safety issues, contact support immediately</p>
          <button
            onClick={() => router.push("/contact-support")}
            className="bg-[#E94335] text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-[#D93025] transition-colors"
          >
            Contact Support
          </button>
        </div>
      </main>
    </div>
  );
}
