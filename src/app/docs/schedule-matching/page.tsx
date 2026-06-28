"use client";

import { useRouter } from "next/navigation";
import HelpNav from "@/components/HelpNav";

const steps = [
  {
    num: 1,
    title: "Drop a Pin",
    text: "Open your profile and move the map to your preferred parking spot. Tap to drop a pin at the exact location where you want to park. This tells our matching engine where you need to be.",
    tip: "Zoom in close to get the most accurate pin placement — within a few meters is ideal.",
  },
  {
    num: 2,
    title: "Set Your Times",
    text: "Enter your arrival time (when you need the spot) and your departure time (when you'll leave). The matching engine uses these windows to find someone with a complementary schedule.",
    tip: "Be as accurate as possible with your times. The closer your window matches a partner, the higher your match priority.",
  },
  {
    num: 3,
    title: "Select Your Vehicle",
    text: "Choose your car type — small, standard, or large. This ensures you're matched with a spot that accommodates your vehicle.",
    tip: "If you drive multiple vehicles, select the largest one you'll regularly park.",
  },
  {
    num: 4,
    title: "Submit & Wait for a Match",
    text: "Once submitted, our matching engine searches for a member who parks in the same area and has an opposite schedule — someone who leaves when you arrive, or arrives when you leave.",
    tip: "You'll receive a push notification when a match is found. Keep notifications enabled for the fastest response.",
  },
  {
    num: 5,
    title: "Accept or Decline",
    text: "When a match is found, review the anonymous partner's details and decide whether to accept. You can see their vehicle type, ranking, and time window.",
    tip: "Accepting quickly improves your ranking. Declining too often may lower your match priority.",
  },
  {
    num: 6,
    title: "Track & Exchange",
    text: "Once confirmed, use Live Track to see your partner's location in real time. The arriving member positions first, then the departing member starts their car and the exchange completes.",
    tip: "Keep your phone charged and notifications on during the exchange window.",
  },
];

export default function ScheduleMatching() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <HelpNav current="docs" />

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="modern-hero px-6 py-10 sm:px-10 sm:py-14 text-center mb-10">
          <div className="relative z-10">
            <h1 className="text-4xl sm:text-5xl font-bold text-white">Schedule Matching</h1>
            <p className="text-white/90 mt-3 text-lg">How to set up recurring parking matches</p>
          </div>
        </div>
        <button onClick={() => router.push("/docs")} className="text-sm text-[#4285F4] hover:underline mb-6 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Docs
        </button>

        <div className="relative mb-8">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-[#4285F4]/20 hidden md:block" />

          <div className="space-y-8">
            {steps.map((step) => (
              <div key={step.num} className="relative flex items-start gap-6">
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-[#E8F0FE] text-[#4285F4] flex items-center justify-center z-10">
                  <span className="text-2xl font-black">{step.num}</span>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-lg font-bold text-[#202124]">{step.title}</h3>
                  <p className="text-sm text-[#757575] mt-1 leading-relaxed">{step.text}</p>
                  <div className="mt-2 bg-[#FFF8E1] border border-[#F9A825]/30 rounded-lg p-3">
                    <p className="text-xs text-[#F57F17]">
                      <span className="font-bold">Tip:</span> {step.tip}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
          <h2 className="font-bold text-[#202124] mb-3">Pre-Scheduled Connections</h2>
          <p className="text-sm text-[#757575] leading-relaxed mb-4">
            For recurring schedules — like a daily work commute — use the Pre-Scheduled Connections feature
            on your profile. Set your weekly schedule, days of the week, and preferred time windows,
            and we'll find anonymous recurring matches automatically.
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-white rounded-xl p-3 border border-gray-200">
              <p className="font-semibold text-[#202124]">Work Commute</p>
              <p className="text-xs text-[#757575] mt-1">Daily or weekly office parking</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-gray-200">
              <p className="font-semibold text-[#202124]">Regular Events</p>
              <p className="text-xs text-[#757575] mt-1">Weekly classes, clubs, or meetups</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-gray-200">
              <p className="font-semibold text-[#202124]">Shift Work</p>
              <p className="text-xs text-[#757575] mt-1">Rotating or fixed shift schedules</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-gray-200">
              <p className="font-semibold text-[#202124]">Custom</p>
              <p className="text-xs text-[#757575] mt-1">Any other recurring pattern</p>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={() => router.push("/profile")}
            className="bg-[#4285F4] text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-[#1A73E8] transition-colors"
          >
            Set Up Your Schedule
          </button>
        </div>
      </main>
    </div>
  );
}
