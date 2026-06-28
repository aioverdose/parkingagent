"use client";

import { useRouter } from "next/navigation";
import HelpNav from "@/components/HelpNav";

const sections = [
  {
    title: "Ranking System",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    color: "bg-[#FFF3E0]",
    iconColor: "text-[#F9A825]",
    items: [
      { label: "What is ranking?", text: "Your ranking (1-5 stars) determines your match priority. Higher-ranked members get matched first when multiple people have overlapping schedules." },
      { label: "How to improve", text: "Complete matches successfully, rate your partners, avoid cancellations, and take the parking laws course. Each successful match adds to your ranking score." },
      { label: "What hurts ranking", text: "Cancelling confirmed matches, no-shows, and low partner ratings all negatively impact your ranking." },
      { label: "Where to see it", text: "Your current ranking and stats (matches, cancels, no-shows) are displayed on your profile page." },
    ],
  },
  {
    title: "Match History",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "bg-[#E8F0FE]",
    iconColor: "text-[#4285F4]",
    items: [
      { label: "Viewing matches", text: "Your profile shows all current and past matches with status (pending, confirmed, cancelled). Each match displays your anonymous partner, time windows, and vehicle info." },
      { label: "Match stats", text: "The top of your match history shows key metrics: total matches, success rate, and average rating." },
      { label: "Actions per match", text: "For pending matches you can Accept or Decline. For confirmed matches use Live Track. After an exchange, confirm whether parking was successful and rate your partner." },
    ],
  },
  {
    title: "Pre-Scheduled Connections",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    color: "bg-[#E6F4EA]",
    iconColor: "text-[#0F9D58]",
    items: [
      { label: "What are they?", text: "Pre-Scheduled Connections are recurring anonymous matches based on your regular weekly schedule. Set your days, times, and role once, and we match you automatically each week." },
      { label: "Setting one up", text: "On your profile, select your role (arriver, departor, or both), schedule type, days of the week, and time windows. Submit and we'll find recurring partners." },
      { label: "Managing connections", text: "View your active connections on your profile. Each shows the neighborhood, schedule pattern, partner role, and next occurrence. You can confirm or cancel pending connections." },
      { label: "Privacy", text: "All matches are anonymous. You see a partner alias and vehicle type, never their name or exact identity." },
    ],
  },
  {
    title: "Profile Settings",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: "bg-[#F3E5F5]",
    iconColor: "text-[#7B1FA2]",
    items: [
      { label: "Changing your info", text: "Update your name, email, or neighborhood anytime from the profile form. Changes take effect immediately." },
      { label: "Notifications", text: "Enable push notifications to receive match alerts. You'll be prompted during setup, or manage it in your browser settings." },
      { label: "Password", text: "Use the 'Change password' link at the bottom of your profile to update your password." },
      { label: "Account tier", text: "Your current plan is shown next to your name. Upgrade from the Premium page to unlock additional features." },
    ],
  },
];

export default function AccountGuide() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <HelpNav current="docs" />

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="modern-hero px-6 py-10 sm:px-10 sm:py-14 text-center mb-10">
          <div className="relative z-10">
            <h1 className="text-4xl sm:text-5xl font-bold text-white">Account Guide</h1>
            <p className="text-white/90 mt-3 text-lg">Rankings, matches, connections, and settings</p>
          </div>
        </div>
        <button onClick={() => router.push("/docs")} className="text-sm text-[#4285F4] hover:underline mb-6 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Docs
        </button>

        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.title} className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl ${section.color} flex items-center justify-center ${section.iconColor}`}>
                  {section.icon}
                </div>
                <h2 className="text-xl font-bold text-[#202124]">{section.title}</h2>
              </div>
              <div className="space-y-4">
                {section.items.map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#4285F4] mt-2 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-[#202124] text-sm">{item.label}</h3>
                      <p className="text-sm text-[#757575] mt-0.5 leading-relaxed">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={() => router.push("/profile")}
            className="bg-[#4285F4] text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-[#1A73E8] transition-colors"
          >
            View Your Profile
          </button>
        </div>
      </main>
    </div>
  );
}
