"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, fetchCurrentUser } from "@/lib/auth";
import { api } from "@/lib/api";
import { HoverButton } from "@/components/ui/HoverButton";
import { HoverCard } from "@/components/ui/HoverCard";

const benefits = [
  { title: "Real-time GPS-based ETA", desc: "Drop a pin on the map and see exactly how far available spots are with live ETA." },
  { title: "Drop a Pin on the Map", desc: "Mark exactly where you're arriving on an interactive map." },
  { title: "Preliminary requests to matching users", desc: "System sends non-intrusive alerts to members who match your time and proximity." },
  { title: "Expanding radius alerts", desc: "Alerts expand in radius as you get closer if no match is found (5, 10, 15, 20 blocks)." },
  { title: "Departure Beacon", desc: "Send a beacon when departing. System finds incoming members in your area." },
  { title: "Higher ranking priority", desc: "Premium members get priority over free users in matching." },
  { title: "Unlimited matches", desc: "No restrictions on how many matches you can make." },
];

export default function PremiumPage() {
  const router = useRouter();
  const [user, setUser] = useState(getStoredUser());
  const [loading, setLoading] = useState(false);
  const [upgraded, setUpgraded] = useState(false);

  useEffect(() => {
    fetchCurrentUser().then((u) => { if (u) setUser(u); });
  }, []);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      await api.post("/api/premium/upgrade");
      const u = await fetchCurrentUser();
      if (u) setUser(u);
      setUpgraded(true);
    } catch {
      alert("Upgrade failed. Try again.");
    }
    setLoading(false);
  };

  const isPremium = user?.tier === "premium" || user?.isPremium === true;

  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
          <a href="/" className="text-lg font-bold tracking-tight">
            <span className="text-[#4285F4]">Parking</span>{" "}
            <span className="text-[#0F9D58]">Agent</span>
          </a>
          <div className="flex items-center gap-3 text-sm">
            {user && (
              <a href="/profile" className="text-[#757575] hover:text-[#202124]">Profile</a>
            )}
            <a href="/login" className="text-[#4285F4] hover:underline">Login</a>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-16">
        {upgraded ? (
          <div className="text-center animate-fade-in-up">
            <div className="w-20 h-20 bg-[#E6F4EA] rounded-full flex items-center justify-center mx-auto">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0F9D58" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg>
            </div>
            <h1 className="text-3xl font-black text-[#202124] mt-6">You&apos;re now a Premium member!</h1>
            <p className="text-[#757575] mt-2">You now have access to real-time parking, departure beacon, and priority matching.</p>
            <div className="mt-8 space-y-3">
              <HoverButton onClick={() => router.push("/dashboard")} className="w-full max-w-xs mx-auto">
                Go to Dashboard
              </HoverButton>
              <button onClick={() => router.push("/")} className="block w-full max-w-xs mx-auto text-sm text-[#757575] hover:text-[#202124] py-2">
                Back to Home
              </button>
            </div>
          </div>
        ) : isPremium ? (
          <div className="text-center">
            <div className="w-20 h-20 bg-[#FFF3E0] rounded-full flex items-center justify-center mx-auto">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#F9A825" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
            </div>
            <h1 className="text-3xl font-black text-[#202124] mt-6">You&apos;re already Premium</h1>
            <p className="text-[#757575] mt-2">Enjoy real-time parking, departure beacon, and priority service.</p>
            <div className="mt-8">
              <HoverButton onClick={() => router.push("/dashboard")} className="w-full max-w-xs mx-auto">
                Go to Dashboard
              </HoverButton>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-[#FFF3E0] rounded-full flex items-center justify-center mx-auto">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#F9A825" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
              </div>
              <h1 className="text-3xl font-black text-[#202124] mt-6">Upgrade to Premium</h1>
              <p className="text-[#757575] mt-2 max-w-md mx-auto">
                Get real-time parking service with GPS-based ETA, interactive map pin drop, departure beacon, and priority matching.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-12">
              {benefits.map((b) => (
                <HoverCard key={b.title} className="text-left">
                  <h3 className="font-bold text-[#202124] text-sm">{b.title}</h3>
                  <p className="text-xs text-[#757575] mt-1">{b.desc}</p>
                </HoverCard>
              ))}
            </div>

            <div className="text-center border border-gray-200 rounded-2xl p-8 max-w-sm mx-auto">
              <p className="text-[#757575] text-sm">Premium</p>
              <p className="text-4xl font-black text-[#202124] mt-1">$4.99<span className="text-lg font-medium text-[#757575]">/month</span></p>
              <ul className="mt-6 space-y-2 text-sm text-left">
                {benefits.map((b) => (
                  <li key={b.title} className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-[#0F9D58] mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7" /></svg>
                    <span className="text-[#202124]">{b.title}</span>
                  </li>
                ))}
              </ul>
              <HoverButton onClick={handleUpgrade} disabled={loading} className="w-full mt-6">
                {loading ? "Processing..." : "Subscribe to Premium ($4.99/month)"}
              </HoverButton>
            </div>

            <div className="text-center mt-8">
              <button onClick={() => router.push("/")} className="text-sm text-[#757575] hover:text-[#202124]">
                Back to Home
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
