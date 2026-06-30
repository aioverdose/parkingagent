"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, fetchCurrentUser } from "@/lib/auth";
import { api } from "@/lib/api";
import PushNotifications from "@/components/PushNotifications";
import { ReferralSection } from "@/components/ReferralSection";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

type DashboardView = "main" | "parking-match-demo";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(getStoredUser());
  const [view, setView] = useState<DashboardView>("main");
  const [error, setError] = useState("");
  const [parkingMatchResult, setParkingMatchResult] = useState<any>(null);
  const [pmDemoLoading, setPmDemoLoading] = useState(false);

  useEffect(() => { if (!user) { router.push("/signup"); } }, [user, router]);

  useEffect(() => {
    fetchCurrentUser().then((u) => { if (u) setUser(u); });
  }, []);

  if (!user) return null;

  const handleParkingMatchDemo = async () => {
    setView("parking-match-demo"); setPmDemoLoading(true); setError(""); setParkingMatchResult(null);
    try {
      await api.post("/api/demo/create");
      await api.post("/api/parking-match-schedule", { leavingTime: "17:30", arrivalLookingTime: "08:00" });
      await api.post("/api/parking-match/run");
      const { matches } = await api.get<{ matches: any[] }>("/api/parking-match/my-matches");
      const active = matches.find((m: any) => m.status === "pending" || m.status === "confirmed");
      setParkingMatchResult(active || matches[0] || null);
    } catch {
      setError("Demo failed. Try again.");
      setTimeout(() => setView("main"), 3000);
    }
    setPmDemoLoading(false);
  };

  const handleBack = () => { setView("main"); };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 flex items-center justify-between h-20">
          <a href="/" className="text-2xl font-bold tracking-tight text-[#2563EB]">spotimization</a>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-[#64748B] hidden sm:inline">{user.name}</span>
            {(user as any).earlyAdopter && <Badge variant="info">1 Year Free</Badge>}
            <a href="/docs" className="text-[#64748B] font-medium hover:underline">Docs</a>
            <a href="/profile" className="text-[#2563EB] font-medium hover:underline">Profile</a>
            <button onClick={() => { localStorage.removeItem("spotimization_auth"); router.push("/"); }} className="text-[#EF4444] font-medium hover:underline ml-1">Sign out</button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <section className="modern-hero px-6 py-10 sm:px-10 sm:py-14 mb-8">
          <div className="relative z-10 max-w-3xl">
            <Badge variant="info" className="bg-white/15 text-white">Street Parking Assist</Badge>
            <h1 className="mt-5 text-4xl sm:text-5xl font-bold text-white">Schedule-based parking matching.</h1>
            <p className="mt-4 text-lg sm:text-xl text-white/90 max-w-2xl">
              Set your schedule, vehicle type, and area. We match you with compatible members automatically.
            </p>

          </div>
        </section>

        <div className="max-w-xl mx-auto">
        {/* Status Badge */}
        <div className="text-center mb-8">
          <Badge variant={user.isMember ? "success" : user.status === "pending" ? "warning" : "error"}>
            {user.isMember ? "Membership Active" : user.status === "pending" ? "Pending — Complete Courses" : "Membership Inactive"}
          </Badge>
          {(user as any).tier === "free" && (
            <div className="mt-3 bg-gradient-to-r from-[#DBEAFE] to-[#EDE9FE] border border-[#10B981]/20 rounded-xl p-3 text-xs text-left flex items-start gap-2">
              <span className="text-lg shrink-0">🏆</span>
              <div>
                <p className="font-semibold text-[#10B981]">Early Adopter — 1 Year Free</p>
                <p className="text-[#64748B] mt-0.5">You're one of the first 100 users! All features are unlocked free for one year. No monthly fees for 12 months.</p>
              </div>
            </div>
          )}
          
        </div>

        {view === "main" && (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#1E293B]">Welcome, {user.name.split(" ")[0]}</h1>
            <p className="text-sm text-[#64748B] mt-1">Schedule-based parking matching</p>

            {error && <p className="text-sm text-[#EF4444] mt-3">{error}</p>}

            <div className="mt-8 modern-card text-left">
              <button onClick={handleParkingMatchDemo}
                className="w-full bg-[#F59E0B] text-white px-7 py-4 rounded-lg font-semibold text-base shadow-[0_4px_12px_rgba(245,158,11,0.3)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.4)] hover:-translate-y-0.5 hover:bg-[#D97706] transition-all duration-300 flex items-center justify-center gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>
                Try Schedule Matching
              </button>
              <a href="/profile" className="mt-3 block w-full bg-[#2563EB] text-white px-7 py-4 rounded-lg font-semibold text-base shadow-[0_4px_12px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)] hover:-translate-y-0.5 hover:bg-[#1D4ED8] transition-all duration-300 text-center">
                Set Your Schedule in Profile
              </a>
            </div>

            {/* Ranking */}
            <Card className="mt-6 text-left">
              <h3 className="font-semibold text-xs text-[#1E293B] mb-2">Your Ranking</h3>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#64748B]">Ranking</span>
                <span className="text-[#1E293B] font-semibold">{user.ranking || 5} / 5 {"★".repeat(user.ranking || 5).trim()}</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-[#64748B]">Matches</span>
                <span className="text-[#1E293B] font-semibold">{user.matchCount || 0}</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-[#64748B]">Status</span>
                <span className="text-[#10B981] font-semibold">Good Standing</span>
              </div>
            </Card>

            <div className="mt-4"><ReferralSection /></div>

            <PushNotifications />
          </div>
        )}

        {view === "parking-match-demo" && (
          <div className="text-center animate-fade-in-up">
            {pmDemoLoading ? (
              <>
                <div className="w-16 h-16 border-4 border-[#FEF3C7] border-t-[#F59E0B] rounded-full animate-spin mx-auto" />
                <h2 className="text-xl font-bold text-[#1E293B] mt-4">Searching for a match...</h2>
                <p className="text-sm text-[#64748B] mt-2">Creating demo data and running matching logic.</p>
              </>
            ) : parkingMatchResult ? (
              <>
                <div className="w-16 h-16 bg-[#FEF3C7] rounded-full flex items-center justify-center mx-auto">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg>
                </div>
                <h2 className="text-xl font-bold text-[#1E293B] mt-3">You've been matched!</h2>
                <p className="text-sm text-[#64748B] mt-1">Someone is leaving their spot around your arrival time.</p>

                <Card className="mt-5 text-left space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#64748B]">Matched with</span>
                    <span className="text-[#1E293B] font-semibold">{parkingMatchResult.anonymousPartner || "Member #DEMO"}</span>
                  </div>
                  {parkingMatchResult.partnerVehicleInfo && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#64748B]">Vehicle</span>
                      <span className="text-[#1E293B] font-semibold">
                        {parkingMatchResult.partnerVehicleInfo.type || "car"} / {parkingMatchResult.partnerVehicleInfo.size || "standard"}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#64748B]">Their leaving time</span>
                    <span className="text-[#2563EB] font-semibold">
                          {parkingMatchResult.leavingTime ? (() => { const h = Math.floor(parkingMatchResult.leavingTime / 60); const m = parkingMatchResult.leavingTime % 60; const p = h >= 12 ? "PM" : "AM"; const h12 = h % 12 || 12; return `${h12}:${m.toString().padStart(2, "0")} ${p}`; })() : "~8:10 AM"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#64748B]">Your arrival time</span>
                        <span className="text-[#10B981] font-semibold">
                          {parkingMatchResult.arrivalLookingTime ? (() => { const h = Math.floor(parkingMatchResult.arrivalLookingTime / 60); const m = parkingMatchResult.arrivalLookingTime % 60; const p = h >= 12 ? "PM" : "AM"; const h12 = h % 12 || 12; return `${h12}:${m.toString().padStart(2, "0")} ${p}`; })() : "~8:00 AM"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#64748B]">Status</span>
                    <Badge variant={parkingMatchResult.status === "confirmed" ? "success" : "warning"}>{parkingMatchResult.status}</Badge>
                  </div>
                </Card>

                <div className="mt-4 text-xs text-[#64748B] bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-3 text-left">
                  <p className="font-semibold text-[#1E293B] mb-1">How this matches your schedule</p>
                  <p>You submitted: leave at 5:30 PM, arrive looking at 8:00 AM.</p>
                  <p className="mt-1">Demo member: leaves at 8:10 AM (within 10 min of your arrival), arrives looking at 5:45 PM (within 15 min of your leave).</p>
                </div>

                <div className="mt-5 space-y-2">
                  <button onClick={() => router.push("/profile")}
                    className="w-full bg-[#2563EB] text-white px-6 py-4 rounded-2xl font-bold shadow-[0_4px_12px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)] hover:-translate-y-0.5 hover:bg-[#1D4ED8] transition-all duration-200">
                    View All Matches in Profile
                  </button>
                  <button onClick={handleBack}
                    className="w-full bg-white text-[#2563EB] border-2 border-[#2563EB] font-semibold rounded-2xl hover:bg-[#DBEAFE] px-6 py-3 text-sm transition-all duration-200">
                    Back to Dashboard
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-[#1E293B]">No match found</h2>
                <p className="text-sm text-[#64748B] mt-2">Try setting up your schedule in your profile first.</p>
                <button onClick={handleBack} className="mt-4 text-sm text-[#2563EB] font-medium hover:underline">Back</button>
              </>
            )}
          </div>
        )}
        </div>
      </main>
    </div>
  );
}
