"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signup } from "@/lib/auth";
import { api } from "@/lib/api";

export default function Signup() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<"form" | "verify-phone" | "done">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTos, setAgreeTos] = useState(false);
  const [agreeLocation, setAgreeLocation] = useState(false);
  const [agreeAge, setAgreeAge] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [verificationCode, setVerificationCode] = useState("");
  const [devCode, setDevCode] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [signupCount, setSignupCount] = useState<{ count: number; remaining: number; isFull: boolean } | null>(null);

  useEffect(() => {
    api.get<{ count: number; remaining: number; isFull: boolean }>("/api/signup-count").then(setSignupCount).catch(() => {});
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !password.trim() || !phone.trim()) { setError("All fields are required."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (!agreeTos) { setError("You must agree to the Terms of Use and Guidelines."); return; }
    if (!agreeLocation) { setError("You must agree to location access."); return; }
    if (!agreeAge) { setError("You must be 16 years or older."); return; }

    setLoading(true);
    try {
      const res = await api.post<{ user: { id: string; phone: string } }>("/api/auth/register", {
        name, email, password, phone, completedModuleIds: [],
      });
      setUserId(res.user.id);
      setPhoneNumber(res.user.phone);
      const codeRes = await api.post<{ code?: string; dev?: boolean }>("/api/auth/request-phone-verification", {
        phone: res.user.phone,
        userId: res.user.id,
      });
      if (codeRes.code) {
        setDevCode(codeRes.code);
      }
      setStep("verify-phone");
    } catch (err: any) {
      setError(err.message || "Signup failed. The email may already be registered.");
    }
    setLoading(false);
  };

  const handleVerifyPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError("");
    if (!verificationCode.trim()) { setPhoneError("Enter the verification code."); return; }
    setPhoneLoading(true);
    try {
      await api.post("/api/auth/verify-phone", {
        phone: phoneNumber,
        code: verificationCode.trim(),
      });
      setStep("done");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err: any) {
      setPhoneError(err.message || "Invalid code. Try again.");
    }
    setPhoneLoading(false);
  };

  const handleResendCode = async () => {
    setPhoneLoading(true);
    try {
      const codeRes = await api.post<{ code?: string; dev?: boolean }>("/api/auth/request-phone-verification", {
        phone: phoneNumber,
        userId,
      });
      if (codeRes.code) {
        setDevCode(codeRes.code);
      }
      setPhoneError("");
    } catch {
      setPhoneError("Failed to resend code.");
    }
    setPhoneLoading(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
          <a href="/" className="text-lg font-bold tracking-tight">spotimization</a>
          <a href="/login" className="text-sm font-medium text-[#757575] hover:text-[#202124] transition-colors">Login</a>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {step === "form" && (
            <div>
              <h1 className="text-3xl font-black text-[#202124] text-center">Sign Up</h1>
              <p className="text-center text-[#757575] mt-2 text-sm">Join spotimization and start matching</p>

              {signupCount && !signupCount.isFull && (
                <div className="mt-6 bg-gradient-to-r from-[#E8F0FE] to-[#E6F4EA] border border-[#4285F4]/20 rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-[#4285F4]">{signupCount.remaining}</div>
                  <p className="text-xs text-[#757575]">FREE spots remaining</p>
                  <div className="mt-2 w-full bg-white/60 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-[#4285F4] to-[#0F9D58] h-full rounded-full transition-all duration-500" style={{ width: `${(signupCount.count / 100) * 100}%` }} />
                  </div>
                  <p className="text-xs text-[#757575] mt-2">
                    First 100 users get <strong>1 year FREE</strong> &mdash; 1 Year Free badge, unlimited matching.
                  </p>
                </div>
              )}
              {signupCount?.isFull && (
                <div className="mt-6 bg-[#FCE8E6] border border-[#E94335]/20 rounded-xl p-4 text-center">
                  <p className="text-sm font-bold text-[#E94335]">First 100 spots are filled</p>
                  <p className="text-xs text-[#757575] mt-1">
                    New members join at <strong>$4.99/month</strong> for premium access.
                  </p>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="mt-6 space-y-4">
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
                  <label htmlFor="phone" className="block text-sm font-medium text-[#202124] mb-1">Phone</label>
                  <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] focus:border-[#4285F4] outline-none transition"
                    placeholder="+1 (555) 123-4567" />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-[#202124] mb-1">Password</label>
                  <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] focus:border-[#4285F4] outline-none transition"
                    placeholder="At least 6 characters" />
                </div>

                <div className="space-y-3 pt-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={agreeTos} onChange={(e) => setAgreeTos(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-[#4285F4] focus:ring-[#4285F4]" required />
                    <span className="text-sm text-[#202124]">
                      I agree to the <a href="/terms" className="text-[#4285F4] underline">Terms of Use</a> and <a href="/guidelines" className="text-[#4285F4] underline">Guidelines</a>
                    </span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={agreeLocation} onChange={(e) => setAgreeLocation(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-[#4285F4] focus:ring-[#4285F4]" required />
                    <span className="text-sm text-[#202124]">
                      I understand that location services will be accessed on my mobile device. I will need to allow location access to use this service.
                    </span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={agreeAge} onChange={(e) => setAgreeAge(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-[#4285F4] focus:ring-[#4285F4]" required />
                    <span className="text-sm text-[#202124]">
                      I am 16 years or older
                    </span>
                  </label>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-[#4285F4] text-white px-6 py-3.5 rounded-xl font-bold text-base hover:bg-[#1A73E8] transition-colors disabled:opacity-50">
                  {loading ? "Creating account..." : "Sign Up"}
                </button>
              </form>
            </div>
          )}

          {step === "verify-phone" && (
            <div className="text-center">
              <div className="text-5xl mb-4">{"\uD83D\uDCF1"}</div>
              <h1 className="text-3xl font-black text-[#202124]">Verify Your Phone</h1>
              <p className="text-[#757575] mt-2">
                Enter the 6-digit code sent to <strong>{phoneNumber}</strong>.
              </p>

              <form onSubmit={handleVerifyPhone} className="mt-8 space-y-4">
                {phoneError && <div className="bg-[#FCE8E6] border border-[#E94335]/30 text-[#E94335] text-sm p-3 rounded-xl">{phoneError}</div>}

                {devCode && (
                  <div className="bg-[#FFF3E0] border border-[#F9A825]/30 rounded-xl p-4">
                    <p className="text-xs text-[#F57F17] font-medium">Dev mode &mdash; your code is:</p>
                    <p className="text-2xl font-black text-[#E65100] tracking-widest">{devCode}</p>
                  </div>
                )}

                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-[#202124] mb-1">Verification Code</label>
                  <input id="code" type="text" inputMode="numeric" maxLength={6} value={verificationCode} onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] focus:border-[#4285F4] outline-none transition text-center text-2xl tracking-widest"
                    placeholder="000000" />
                </div>

                <button type="submit" disabled={phoneLoading || verificationCode.length !== 6}
                  className="w-full bg-[#4285F4] text-white px-6 py-3.5 rounded-xl font-bold text-base hover:bg-[#1A73E8] transition-colors disabled:opacity-50">
                  {phoneLoading ? "Verifying..." : "Verify Phone"}
                </button>
              </form>

              <button onClick={handleResendCode} disabled={phoneLoading}
                className="mt-4 text-sm text-[#4285F4] hover:underline">
                Resend code
              </button>
            </div>
          )}

          {step === "done" && (
            <div className="text-center">
              <div className="text-5xl mb-4">{"\u2705"}</div>
              <h1 className="text-3xl font-black text-[#202124]">Phone Verified</h1>
              <p className="text-[#757575] mt-2">Redirecting to dashboard...</p>
            </div>
          )}

          <div className="flex items-center justify-center gap-4 mt-8 text-xs text-[#757575]">
            <span>By signing up you agree to our <a href="/terms" className="underline hover:text-[#202124]">Terms of Service</a></span>
          </div>
        </div>
      </main>
    </div>
  );
}
