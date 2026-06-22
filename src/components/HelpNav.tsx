"use client";

import { useRouter } from "next/navigation";

const helpPages = [
  { id: "help-center", label: "Help Center", path: "/help-center" },
  { id: "how-it-works", label: "How It Works", path: "/how-it-works" },
  { id: "safety-tips", label: "Safety Tips", path: "/safety-tips" },
  { id: "contact-support", label: "Contact Support", path: "/contact-support" },
  { id: "troubleshooting", label: "Troubleshooting", path: "/troubleshooting" },
];

export default function HelpNav({ current }: { current?: string }) {
  const router = useRouter();

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between h-20">
          <button onClick={() => router.push("/")} className="text-xl font-bold tracking-tight">
            <span className="text-[#2563EB]">spotimization</span>
          </button>
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/profile")} className="text-sm font-semibold text-[#475569] hover:text-[#2563EB] transition-colors">Profile</button>
            <button onClick={() => router.push("/dashboard")} className="text-sm font-semibold text-[#475569] hover:text-[#2563EB] transition-colors">Dashboard</button>
          </div>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-3 scrollbar-none">
          {helpPages.map((page) => (
            <button
              key={page.id}
              onClick={() => router.push(page.path)}
              className={`whitespace-nowrap text-sm px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                current === page.id
                  ? "bg-[#2563EB] text-white shadow-[0_4px_12px_rgba(37,99,235,0.3)]"
                  : "text-[#475569] hover:text-[#2563EB] hover:bg-[#DBEAFE]"
              }`}
            >
              {page.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
