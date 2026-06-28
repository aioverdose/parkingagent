"use client";

import { useRouter } from "next/navigation";
import HelpNav from "@/components/HelpNav";

const sections = [
  {
    title: "Creating Your Account",
    steps: [
      { label: "Sign Up", text: "Go to /signup and create your account with your name, email, and phone number." },
      { label: "Verify Your Email", text: "After signing up, check your inbox for a verification email. Click the link to confirm your address. Your account works even if you skip this step." },
      { label: "Set Your Neighborhood", text: "Choose your neighborhood from your profile page. This helps us match you with nearby members." },
    ],
  },
  {
    title: "Your Profile",
    steps: [
      { label: "Name & Email", text: "Keep your contact info up to date in your profile settings. This is how other members will know you." },
      { label: "Neighborhood", text: "Setting your neighborhood unlocks the Pre-Scheduled Connections feature, which matches you with members on a recurring basis." },
      { label: "Car Type", text: "Selecting your vehicle type (small, standard, or large) ensures you get matched with spots that fit your car." },
    ],
  },
  {
    title: "Understanding Your Dashboard",
    steps: [
      { label: "Main View", text: "Your dashboard shows the current state of your parking — active matches, arriving cars, and available actions." },
      { label: "Match History", text: "View all your past and present matches, including status, ratings, and partner information." },
      { label: "Notifications", text: "Enable push notifications to get alerted when a match is found, someone is arriving, or an exchange is complete." },
    ],
  },
  {
    title: "Next Steps",
    steps: [
      { label: "Set Up a Schedule", text: "Head to your profile to drop a pin on your parking spot and set your arrival and departure times." },
      { label: "Try the Arrival Beacon", text: "Need a spot right now? Activate the Arrival Beacon to find an immediate match." },
      { label: "Complete the Course", text: "Take the short course on local parking laws to improve your ranking and unlock premium features." },
    ],
  },
];

export default function GettingStarted() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <HelpNav current="docs" />

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="modern-hero px-6 py-10 sm:px-10 sm:py-14 text-center mb-10">
          <div className="relative z-10">
            <h1 className="text-4xl sm:text-5xl font-bold text-white">Getting Started</h1>
            <p className="text-white/90 mt-3 text-lg">Everything you need to begin parking with spotimization</p>
          </div>
        </div>
        <button onClick={() => router.push("/docs")} className="text-sm text-[#4285F4] hover:underline mb-6 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Docs
        </button>

        <div className="space-y-10">
          {sections.map((section) => (
            <div key={section.title} className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-[#202124] mb-4">{section.title}</h2>
              <div className="space-y-4">
                {section.steps.map((step) => (
                  <div key={step.label} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#4285F4] mt-2 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-[#202124] text-sm">{step.label}</h3>
                      <p className="text-sm text-[#757575] mt-0.5 leading-relaxed">{step.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-gradient-to-br from-[#E8F0FE] to-[#E6F4EA] rounded-2xl p-8 text-center border border-[#4285F4]/20">
          <h3 className="font-bold text-[#202124] mb-2">Ready to find your spot?</h3>
          <p className="text-sm text-[#757575] mb-4">Set up your first parking schedule</p>
          <button
            onClick={() => router.push("/profile")}
            className="bg-[#4285F4] text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-[#1A73E8] transition-colors"
          >
            Go to Profile
          </button>
        </div>
      </main>
    </div>
  );
}
