"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import troubleshootingData from "@/data/troubleshooting.json";
import HelpNav from "@/components/HelpNav";

const actionHandlers: Record<string, () => void> = {
  "test-gps": () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => alert("GPS is working correctly. Your location was found."),
        () => alert("GPS is not working. Please check your location settings."),
        { enableHighAccuracy: true, timeout: 5000 },
      );
    } else {
      alert("GPS is not supported on this device.");
    }
  },
  "clear-cache": () => alert("Cache clearing instructions: Go to Settings > App > Spotimization > Clear Cache."),
  "try-again": () => window.location.reload(),
  "edit-request": () => window.location.href = "/dashboard",
  "report-issue": () => window.location.href = "/contact-support",
  "check-settings": () => {
    if (navigator.mediaSession) {
      alert("Please check your device notification settings for Spotimization.");
    } else {
      alert("Please check your device Settings > Notifications > Spotimization.");
    }
  },
};

export default function Troubleshooting() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    if (!search.trim()) return troubleshootingData.issues;
    const q = search.toLowerCase();
    return troubleshootingData.issues.filter(
      (issue) =>
        issue.title.toLowerCase().includes(q) ||
        issue.problem.toLowerCase().includes(q) ||
        issue.solutions.some((s) => s.toLowerCase().includes(q)),
    );
  }, [search]);

  const toggle = (id: string) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="min-h-screen bg-white">
      <HelpNav current="troubleshooting" />

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#202124]">Troubleshooting</h1>
          <p className="text-[#757575] mt-2">Common issues and solutions</p>
        </div>

        <div className="relative mb-10">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#757575]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search troubleshooting..."
            className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-2xl text-sm focus:ring-2 focus:ring-[#4285F4] focus:border-[#4285F4] outline-none bg-gray-50"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#757575]">No results found for &ldquo;{search}&rdquo;</p>
            <button onClick={() => setSearch("")} className="mt-2 text-sm text-[#4285F4] hover:underline">Clear search</button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((issue) => {
              const open = expanded[issue.id];
              return (
                <div key={issue.id} className="border border-gray-200 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => toggle(issue.id)}
                    className="w-full flex items-center gap-4 px-6 py-5 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-12 h-12 bg-[#E8F0FE] rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                      {issue.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[#202124] text-sm">{issue.title}</h3>
                      <p className="text-xs text-[#757575] mt-0.5">{issue.problem}</p>
                    </div>
                    <svg className={`w-5 h-5 text-[#757575] flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {open && (
                    <div className="px-6 pb-5 border-t border-gray-100 pt-4">
                      <div className="space-y-3 mb-4">
                        {issue.solutions.map((solution, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <span className="w-5 h-5 rounded-full bg-[#E8F0FE] text-[#4285F4] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="text-sm text-[#202124]">{solution}</span>
                          </div>
                        ))}
                      </div>
                      {actionHandlers[issue.buttonAction] && (
                        <button
                          onClick={actionHandlers[issue.buttonAction]}
                          className="bg-[#4285F4] text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-[#1A73E8] transition-colors"
                        >
                          {issue.buttonText}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-10 text-center border-t border-gray-200 pt-8">
          <p className="text-sm text-[#757575] mb-4">Still having issues?</p>
          <button
            onClick={() => router.push("/contact-support")}
            className="text-[#4285F4] font-bold text-sm hover:underline"
          >
            Contact Support &rarr;
          </button>
        </div>
      </main>
    </div>
  );
}
