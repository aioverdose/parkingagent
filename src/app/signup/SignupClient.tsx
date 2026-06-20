"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signup } from "@/lib/auth";
import { api } from "@/lib/api";
import { HoverButton } from "@/components/ui/HoverButton";

interface CourseModule {
  id: string;
  title: string;
  description: string;
  content: string;
  completed: boolean;
  isActive: boolean;
  required: boolean;
}

export default function Signup() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const stepParam = searchParams.get("step");
  const [step, setStep] = useState<"form" | "phone" | "courses">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [loadingModules, setLoadingModules] = useState(true);
  const [devCode, setDevCode] = useState("");

  // Restore pending signup data from TOS redirect
  useEffect(() => {
    const pending = sessionStorage.getItem("pending_signup");
    if (pending) {
      try {
        const data = JSON.parse(atob(pending));
        if (data.name) setName(data.name);
        if (data.email) setEmail(data.email);
        if (data.password) setPassword(data.password);
        if (data.phone) setPhone(data.phone);
        if (data.phoneVerified) setPhoneVerified(true);
      } catch {}
      sessionStorage.removeItem("pending_signup");
    }
  }, []);

  // When redirected from TOS, move to courses step
  useEffect(() => {
    const tosAccepted = sessionStorage.getItem("tos_accepted");
    if (stepParam === "courses" && tosAccepted) {
      setStep("courses");
      sessionStorage.removeItem("tos_accepted");
    }
  }, [stepParam]);

  useEffect(() => {
    api.get<{ modules: CourseModule[] }>("/api/courses").then(({ modules }) => {
      setModules(modules.map((m) => ({ ...m, completed: false })));
    }).catch(() => {}).finally(() => setLoadingModules(false));
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !password.trim()) { setError("All fields are required."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setStep("phone");
  };

  const handleSendCode = async () => {
    setError("");
    if (!phone || !/^\d{10,15}$/.test(phone.replace(/\D/g, ""))) {
      setError("Enter a valid phone number (10-15 digits).");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post<{ success: boolean; message: string; devCode?: string }>("/api/auth/request-phone-verification", { phone });
      setCodeSent(true);
      if (res.devCode) setDevCode(res.devCode);
    } catch {
      setError("Failed to send code. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setError("");
    if (!verificationCode) { setError("Enter the verification code."); return; }
    setLoading(true);
    try {
      await api.post<{ success: boolean }>("/api/auth/verify-phone", { phone, code: verificationCode });
      setPhoneVerified(true);
      // Redirect to TOS
      const pending = btoa(JSON.stringify({ name, email, password, phone, phoneVerified: true }));
      router.push("/tos?pending=" + encodeURIComponent(pending));
    } catch {
      setError("Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (id: string) => setModules((prev) => prev.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m)));
  const allComplete = modules.length > 0 && modules.every((m) => m.completed);

  const handleComplete = async () => {
    setLoading(true);
    const completedModuleIds = modules.filter((m) => m.completed).map((m) => m.id);
    const user = await signup({ name, email, password, phone, completedModuleIds });
    setLoading(false);
    if (user) { router.push("/dashboard"); } else { setError("Signup failed. The email may already be registered."); }
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
          <a href="/" className="text-lg font-bold tracking-tight"><span className="text-[#4285F4]">Parking</span> <span className="text-[#0F9D58]">Agent</span></a>
          <a href="/login" className="text-sm font-medium text-[#757575] hover:text-[#202124] transition-colors">Login</a>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step === "form" ? "bg-[#4285F4] text-white" : "bg-[#E8F0FE] text-[#4285F4]"}`}>1</div>
            <div className="w-8 h-0.5 bg-gray-200" />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step === "phone" ? "bg-[#4285F4] text-white" : "bg-[#E8F0FE] text-[#4285F4]"}`}>2</div>
            <div className="w-8 h-0.5 bg-gray-200" />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step === "courses" ? "bg-[#4285F4] text-white" : "bg-[#E8F0FE] text-[#4285F4]"}`}>3</div>
          </div>

          {/* Step 1: Name, Email, Password */}
          {step === "form" && (
            <div>
              <h1 className="text-3xl font-black text-[#202124] text-center">Sign Up</h1>
              <p className="text-center text-[#757575] mt-2 text-sm">Create your Parking Agent membership account</p>
              <form onSubmit={handleFormSubmit} className="mt-8 space-y-4">
                {error && <div className="bg-[#FCE8E6] border border-[#E94335]/30 text-[#E94335] text-sm p-3 rounded-xl">{error}</div>}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-[#202124] mb-1">Name</label>
                  <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] focus:border-[#4285F4] outline-none transition"
                    placeholder="Your full name" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#202124] mb-1">Email</label>
                  <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] focus:border-[#4285F4] outline-none transition"
                    placeholder="you@example.com" />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-[#202124] mb-1">Password</label>
                  <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] focus:border-[#4285F4] outline-none transition"
                    placeholder="At least 6 characters" />
                </div>
                <button type="submit"
                  className="w-full bg-[#4285F4] text-white px-6 py-3.5 rounded-xl font-bold text-base hover:bg-[#1A73E8] transition-colors">
                  Next: Verify Phone
                </button>
              </form>
            </div>
          )}

          {/* Step 2: Phone Verification */}
          {step === "phone" && (
            <div>
              <h1 className="text-3xl font-black text-[#202124] text-center">Verify Your Phone</h1>
              <p className="text-center text-[#757575] mt-2 text-sm">We&apos;ll send a verification code to your phone.</p>

              {error && <div className="bg-[#FCE8E6] border border-[#E94335]/30 text-[#E94335] text-sm p-3 rounded-xl mt-6">{error}</div>}

              <div className="mt-8 space-y-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-[#202124] mb-1">Phone Number</label>
                  <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    disabled={codeSent}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] focus:border-[#4285F4] outline-none transition disabled:bg-gray-100"
                    placeholder="+1 (555) 123-4567" />
                </div>

                {!codeSent ? (
                  <HoverButton onClick={handleSendCode} disabled={loading} className="w-full">
                    {loading ? "Sending..." : "Send Verification Code"}
                  </HoverButton>
                ) : (
                  <>
                    <div>
                      <label htmlFor="code" className="block text-sm font-medium text-[#202124] mb-1">Verification Code</label>
                      <input id="code" type="text" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] focus:border-[#4285F4] outline-none transition"
                        placeholder="6-digit code" maxLength={6} />
                    </div>
                    {devCode && (
                      <div className="bg-[#E8F0FE] border border-[#4285F4]/30 text-[#4285F4] text-sm p-3 rounded-xl">
                        Dev mode: use code <strong>{devCode}</strong>
                      </div>
                    )}
                    <HoverButton onClick={handleVerifyCode} disabled={loading} className="w-full">
                      {loading ? "Verifying..." : "Verify & Continue"}
                    </HoverButton>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Courses */}
          {step === "courses" && (
            <div>
              <h1 className="text-3xl font-black text-[#202124] text-center">Required Courses</h1>
              <p className="text-center text-[#757575] mt-2 text-sm">Complete all modules to activate your membership.</p>

              {loadingModules ? (
                <div className="mt-8 flex justify-center"><div className="w-8 h-8 border-4 border-[#E8F0FE] border-t-[#4285F4] rounded-full animate-spin" /></div>
              ) : (
                <div className="mt-8 space-y-3">
                  {modules.map((mod) => (
                    <div key={mod.id} className={`w-full text-left border rounded-xl transition-all ${mod.completed ? "border-[#0F9D58] bg-[#E6F4EA]" : "border-gray-200 bg-white"}`}>
                      <button onClick={() => toggleModule(mod.id)} className="w-full text-left p-4 flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-[#202124] text-sm">{mod.title}</h3>
                          <p className="text-xs text-[#757575] mt-0.5 truncate">{mod.description}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center mt-0.5 ${mod.completed ? "bg-[#0F9D58] border-[#0F9D58]" : "border-gray-300"}`}>
                          {mod.completed && <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M3 7.5L5.5 10L11 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                        </div>
                      </button>
                      {mod.completed && <div className="px-4 pb-4"><p className="text-xs text-[#757575] leading-relaxed">{mod.content}</p></div>}
                    </div>
                  ))}
                </div>
              )}

              <button onClick={handleComplete} disabled={!allComplete || loading}
                className={`mt-6 w-full px-6 py-3.5 rounded-xl font-bold text-base transition-colors ${
                  allComplete && !loading
                    ? "bg-[#0F9D58] text-white hover:bg-[#34A853]"
                    : "bg-gray-200 text-[#BDBDBD] cursor-not-allowed"
                }`}>
                {loading ? "Creating account..." : allComplete ? "Complete & Activate Membership" : loadingModules ? "Loading..." : "Complete All Modules to Continue"}
              </button>
              {error && <p className="text-center text-[#E94335] text-xs mt-4">{error}</p>}
            </div>
          )}

          {/* Footer links */}
          <div className="flex items-center justify-center gap-4 mt-8 text-xs text-[#757575]">
            {step === "phone" && (
              <button onClick={() => setStep("form")} className="hover:text-[#202124]">&larr; Back</button>
            )}
            {step === "courses" && (
              <a href="/tos" className="hover:text-[#202124]">Terms of Service</a>
            )}
            <span>By signing up you agree to our <a href="/tos" className="underline hover:text-[#202124]">Terms of Service</a></span>
          </div>
        </div>
      </main>
    </div>
  );
}
