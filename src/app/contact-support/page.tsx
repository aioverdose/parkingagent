"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import HelpNav from "@/components/HelpNav";

const subjects = [
  "Technical Issue",
  "Account Problem",
  "Payment Issue",
  "Safety Concern",
  "Other",
];

const supportCards = [
  {
    title: "Email Support",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    detail: "support@spotimization.com",
    response: "Within 24 hours",
    action: () => window.location.href = "mailto:support@spotimization.com",
    buttonText: "Send Email",
    color: "text-[#4285F4]",
    bg: "bg-[#E8F0FE]",
  },
  {
    title: "Live Chat",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
    detail: "Chat with support agent",
    response: "Mon-Fri, 9am-6pm PST",
    action: () => {},
    buttonText: "Start Chat",
    color: "text-[#0F9D58]",
    bg: "bg-[#E6F4EA]",
  },
  {
    title: "Phone Support",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    detail: "1-800-SPOT-HELP",
    response: "Mon-Fri, 9am-6pm PST",
    action: () => {},
    buttonText: "Call Now",
    color: "text-[#F9AB00]",
    bg: "bg-[#FEF7E0]",
  },
];

export default function ContactSupport() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    matchId: "",
  });
  const [attachment, setAttachment] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email";
    if (!form.subject) errs.subject = "Subject is required";
    if (!form.message.trim()) errs.message = "Message is required";
    else if (form.message.trim().length < 20) errs.message = "Message must be at least 20 characters";
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    // Simulate submission
    setTimeout(() => {
      setSubmitted(true);
      setForm({ name: "", email: "", subject: "", message: "", matchId: "" });
      setAttachment(null);
    }, 500);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <HelpNav />
        <main className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-8">
          <div className="w-16 h-16 bg-[#D1FAE5] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[#111827] mb-2">Request Sent!</h1>
          <p className="text-[#4B5563] text-base mb-6">We'll get back to you within 24 hours.</p>
          <button onClick={() => { setSubmitted(false); router.push("/help-center"); }} className="bg-[#2563EB] text-white px-6 py-3 rounded-lg font-semibold shadow-[0_4px_12px_rgba(37,99,235,0.3)]">Back to Help Center</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <HelpNav current="contact-support" />

      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-12">
        <div className="modern-hero px-6 py-12 sm:px-10 sm:py-16 text-center mb-10">
          <div className="relative z-10">
            <h1 className="text-4xl sm:text-5xl font-bold text-white">Contact Support</h1>
            <p className="text-white/90 mt-3 text-lg">Fast help for account, match, billing, and safety questions.</p>
          </div>
        </div>

        {/* Support option cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {supportCards.map((card) => (
            <div key={card.title} className="bg-white rounded-xl p-6 text-center shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all duration-300">
              <div className={`w-14 h-14 ${card.bg} rounded-xl flex items-center justify-center mx-auto mb-3 ${card.color}`}>
                {card.icon}
              </div>
              <h3 className="font-bold text-[#202124] text-sm mb-1">{card.title}</h3>
              <p className="text-xs text-[#757575] mb-1">{card.detail}</p>
              <p className="text-xs text-[#0F9D58] mb-4">{card.response}</p>
              <button
                onClick={card.action}
                className={`w-full border-2 border-gray-200 rounded-lg py-3 text-sm font-semibold ${card.color} hover:bg-gray-50 transition-colors`}
              >
                {card.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* Contact form */}
        <div className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-6 md:p-8">
          <h2 className="text-2xl font-bold text-[#111827] mb-1">Submit a Request</h2>
          <p className="text-sm text-[#4B5563] mb-6">Fill out the form and we'll get back to you.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#202124] mb-1">Name <span className="text-[#E94335]">*</span></label>
                <input id="name" type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full" />
                {errors.name && <p className="text-xs text-[#E94335] mt-1">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#202124] mb-1">Email <span className="text-[#E94335]">*</span></label>
                <input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full" />
                {errors.email && <p className="text-xs text-[#E94335] mt-1">{errors.email}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-[#202124] mb-1">Subject <span className="text-[#E94335]">*</span></label>
              <select id="subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full">
                <option value="">Select a subject</option>
                {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.subject && <p className="text-xs text-[#E94335] mt-1">{errors.subject}</p>}
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-[#202124] mb-1">Message <span className="text-[#E94335]">*</span></label>
              <textarea id="message" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full resize-none" />
              {errors.message && <p className="text-xs text-[#E94335] mt-1">{errors.message}</p>}
            </div>

            <div>
              <label htmlFor="matchId" className="block text-sm font-medium text-[#202124] mb-1">Match ID <span className="text-[#757575]">(optional)</span></label>
              <input id="matchId" type="text" value={form.matchId} onChange={(e) => setForm({ ...form, matchId: e.target.value })}
                placeholder="e.g. abc-123-def"
                className="w-full" />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#202124] mb-1">Attachment <span className="text-[#757575]">(optional)</span></label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#2563EB] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                onClick={() => document.getElementById("file-upload")?.click()}>
                <svg className="w-6 h-6 text-[#757575] mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-xs text-[#757575]">{attachment ? attachment.name : "Tap to upload screenshot"}</p>
                <input id="file-upload" type="file" accept="image/*" className="hidden" onChange={(e) => setAttachment(e.target.files?.[0] || null)} />
              </div>
            </div>

            <button type="submit"
              className="w-full bg-[#2563EB] text-white py-3.5 rounded-lg font-semibold text-base hover:bg-[#1D4ED8] shadow-[0_4px_12px_rgba(37,99,235,0.3)] transition-all duration-300">
              Send Request
            </button>
          </form>
        </div>

        <div className="mt-8 text-center bg-[#FEE2E2] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-5">
          <p className="text-sm font-bold text-[#DC2626]">For urgent safety issues, call us immediately</p>
          <p className="text-xs text-[#4B5563] mt-1">Response time: 24 hours for email, instant for chat</p>
        </div>
      </main>
    </div>
  );
}
