"use client";

export default function Membership() {
  const benefits = [
    {
      title: "AI Agentic Matching",
      description:
        "Our AI technology pairs departing members with arriving members in real-time for seamless parking transitions.",
    },
    {
      title: "Long Beach Parking Course",
      description:
        "Access to a comprehensive course on Long Beach street parking laws, time limits, permit zones, and community rules.",
    },
    {
      title: "Rules of Participation",
      description:
        "Clear guidelines on how to participate, maintain good-standing status, and contribute to the community.",
    },
    {
      title: "Ranking System",
      description:
        "Earn ranking points through successful matches and course completion. Higher rank means priority in matching.",
    },
  ];

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
              href="/signup"
              className="bg-[#4285F4] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#1A73E8] transition-colors"
            >
              Start Membership
            </a>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <section className="max-w-5xl mx-auto px-4 pt-12 pb-20">
          <h1 className="text-3xl sm:text-4xl font-black text-center text-[#202124]">
            Membership
          </h1>
          <p className="text-center text-[#757575] mt-2 max-w-2xl mx-auto">
            Join Parking Agent and unlock AI-powered parking matching in Long
            Beach, CA.
          </p>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="font-bold text-[#202124] text-lg">
                  {benefit.title}
                </h3>
                <p className="text-sm text-[#757575] mt-2">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-[#202124] mb-8">
              Pricing
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white border-2 border-[#4285F4]/30 rounded-2xl p-8 shadow-sm text-center">
                <h3 className="text-lg font-semibold text-[#757575]">
                  Monthly
                </h3>
                <p className="text-4xl font-black text-[#202124] mt-4">
                  $9.99
                  <span className="text-lg font-normal text-[#757575]">
                    –$19.99
                  </span>
                </p>
                <p className="text-sm text-[#757575] mt-2">per month</p>
                <ul className="mt-6 space-y-3 text-sm text-left">
                  {[
                    "AI matching technology access",
                    "Parking laws course",
                    "Community participation",
                    "Ranking system access",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="text-[#0F9D58]">✓</span>
                      <span className="text-[#757575]">{item}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="/signup"
                  className="mt-8 block w-full bg-[#0F9D58] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#34A853] transition-colors"
                >
                  Start Monthly
                </a>
              </div>

              <div className="bg-white border-2 border-[#0F9D58]/30 rounded-2xl p-8 shadow-sm text-center relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0F9D58] text-white text-xs font-bold px-4 py-1 rounded-full">
                  Best Value
                </div>
                <h3 className="text-lg font-semibold text-[#757575]">
                  Annual
                </h3>
                <p className="text-4xl font-black text-[#202124] mt-4">
                  $79
                  <span className="text-lg font-normal text-[#757575]">
                    –$149
                  </span>
                </p>
                <p className="text-sm text-[#757575] mt-2">per year</p>
                <ul className="mt-6 space-y-3 text-sm text-left">
                  {[
                    "Everything in Monthly",
                    "2 months free (vs. monthly)",
                    "Priority AI matching",
                    "Early access to new features",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="text-[#0F9D58]">✓</span>
                      <span className="text-[#757575]">{item}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="/signup"
                  className="mt-8 block w-full bg-[#0F9D58] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#34A853] transition-colors"
                >
                  Start Annual
                </a>
              </div>
            </div>
          </div>

          <div className="mt-16 bg-[#E8F0FE] border border-[#4285F4]/20 rounded-2xl p-6 max-w-3xl mx-auto">
            <h2 className="font-bold text-[#1A73E8] text-lg mb-2">
              Membership Disclosure
            </h2>
            <p className="text-sm text-[#757575]">
              Parking Agent is a membership platform. We do not own, sell,
              lease, or control any parking spots. Our technology provides AI
              agentic matching between members. All parking arrangements are
              between members themselves. Membership fees cover access to our
              matching technology, educational courses, and community platform.
            </p>
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
