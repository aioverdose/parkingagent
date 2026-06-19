"use client";

import { useState, useEffect } from "react";
import { signup } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

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
  const [step, setStep] = useState<"form" | "courses">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [loadingModules, setLoadingModules] = useState(true);

  useEffect(() => {
    api.get<{ modules: CourseModule[] }>("/api/courses").then(({ modules }) => {
      setModules(modules.map((m) => ({ ...m, completed: false })));
    }).catch(() => {
      // fallback to empty
    }).finally(() => setLoadingModules(false));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("All fields are required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setStep("courses");
  };

  const toggleModule = (id: string) => {
    setModules((prev) =>
      prev.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m)),
    );
  };

  const allComplete = modules.length > 0 && modules.every((m) => m.completed);

  const handleComplete = async () => {
    setLoading(true);
    const completedModuleIds = modules.filter((m) => m.completed).map((m) => m.id);
    const user = await signup({ name, email, password, completedModuleIds });
    setLoading(false);

    if (user) {
      router.push("/dashboard");
    } else {
      setError("Signup failed. The email may already be registered.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between max-w-5xl mx-auto px-4 py-3">
          <a href="/" className="text-xl font-bold tracking-tight">
            <span className="text-[#4285F4]">Parking</span>{" "}
            <span className="text-[#0F9D58]">Agent</span>
          </a>
          <a href="/login" className="text-sm font-medium text-[#757575] hover:text-[#4285F4] transition-colors">Login</a>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {step === "form" && (
            <div>
              <h1 className="text-3xl font-black text-[#202124] text-center">Sign Up</h1>
              <p className="text-center text-[#757575] mt-2">Create your Parking Agent membership account</p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                {error && (
                  <div className="bg-[#FCE8E6] border border-[#E94335]/30 text-[#E94335] text-sm p-3 rounded-xl">{error}</div>
                )}
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
                  Next: Complete Courses
                </button>
              </form>
            </div>
          )}

          {step === "courses" && (
            <div>
              <h1 className="text-3xl font-black text-[#202124] text-center">Required Courses</h1>
              <p className="text-center text-[#757575] mt-2">Complete all modules to activate your membership.</p>

              {loadingModules ? (
                <div className="mt-8 flex justify-center">
                  <div className="w-8 h-8 border-4 border-[#E8F0FE] border-t-[#4285F4] rounded-full animate-spin" />
                </div>
              ) : (
                <div className="mt-8 space-y-4">
                  {modules.map((mod) => (
                    <div key={mod.id}
                      className={`w-full text-left border rounded-2xl transition-all ${
                        mod.completed ? "border-[#0F9D58] bg-[#E6F4EA]" : "border-gray-200 bg-white"
                      }`}>
                      <button onClick={() => toggleModule(mod.id)}
                        className="w-full text-left p-5 flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-[#202124] text-base">{mod.title}</h3>
                          <p className="text-sm text-[#757575] mt-1">{mod.description}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center mt-0.5 ${
                          mod.completed ? "bg-[#0F9D58] border-[#0F9D58]" : "border-gray-300"
                        }`}>
                          {mod.completed && (
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M3 7.5L5.5 10L11 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                      </button>
                      <div className="px-5 pb-5">
                        <p className="text-xs text-[#757575] leading-relaxed whitespace-pre-line">{mod.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button onClick={handleComplete} disabled={!allComplete || loading}
                className={`mt-8 w-full px-6 py-3.5 rounded-xl font-bold text-base transition-colors ${
                  allComplete && !loading
                    ? "bg-[#0F9D58] text-white hover:bg-[#34A853]"
                    : "bg-gray-200 text-[#BDBDBD] cursor-not-allowed"
                }`}>
                {loading ? "Creating account..." : allComplete ? "Complete & Activate Membership" : loadingModules ? "Loading..." : "Complete All Modules to Continue"}
              </button>
              {error && (
                <p className="text-center text-[#E94335] text-xs mt-4">{error}</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
