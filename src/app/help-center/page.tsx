"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import faqData from "@/data/faq.json";
import HelpNav from "@/components/HelpNav";

export default function HelpCenter() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    if (!search.trim()) return faqData.categories;
    const q = search.toLowerCase();
    return faqData.categories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (i) => i.question.toLowerCase().includes(q) || i.answer.toLowerCase().includes(q),
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [search]);

  const toggle = (key: string) => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <HelpNav current="help-center" />

      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-12">
        <div className="modern-hero px-6 py-12 sm:px-10 sm:py-16 text-center mb-10">
          <div className="relative z-10">
            <h1 className="text-4xl sm:text-5xl font-bold text-white">Help Center</h1>
            <p className="text-white/90 mt-3 text-lg">Find answers, solve issues, and get back to parking faster.</p>
          </div>
        </div>

        <div className="relative mb-10 max-w-3xl mx-auto">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#757575]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for help..."
            className="w-full pl-12 pr-4"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#757575]">No results found for &ldquo;{search}&rdquo;</p>
            <button onClick={() => setSearch("")} className="mt-2 text-sm text-[#4285F4] hover:underline">Clear search</button>
          </div>
        ) : (
          <div className="space-y-8 max-w-3xl mx-auto">
            {filtered.map((category) => (
              <div key={category.id}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{category.icon}</span>
                  <h2 className="text-lg font-bold text-[#202124]">{category.title}</h2>
                </div>
                <div className="space-y-2">
                  {category.items.map((item, idx) => {
                    const key = `${category.id}-${idx}`;
                    const open = expanded[key];
                    return (
                      <div key={key} className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300">
                        <button
                          onClick={() => toggle(key)}
                          className="w-full flex items-center justify-between px-6 py-5 text-left text-base font-semibold text-[#111827] hover:bg-[#F8FAFC] transition-colors"
                        >
                          <span>{item.question}</span>
                          <svg className={`w-4 h-4 text-[#757575] transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {open && (
                          <div className="px-6 pb-5 text-base text-[#4B5563] leading-relaxed border-t border-gray-100 pt-4">
                            {item.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-8 max-w-3xl mx-auto">
          <p className="text-sm text-[#757575] mb-4">Still need help? Check the troubleshooting guide.</p>
          <button
            onClick={() => router.push("/troubleshooting")}
            className="bg-[#2563EB] text-white px-8 py-3.5 rounded-lg font-semibold text-base hover:bg-[#1D4ED8] shadow-[0_4px_12px_rgba(37,99,235,0.3)] transition-all duration-300"
          >
            Troubleshooting
          </button>
        </div>
      </main>
    </div>
  );
}
