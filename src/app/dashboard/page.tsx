"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, fetchCurrentUser } from "@/lib/auth";
import { api } from "@/lib/api";
import MapView from "@/components/MapView";
import PushNotifications from "@/components/PushNotifications";
import { ReferralSection } from "@/components/ReferralSection";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

type DashboardView = "main" | "leaving" | "need-spot" | "waiting" | "matched" | "parking-match-demo" | "upgrade-modal";

interface MatchData {
  id: string;
  status: string;
  spotLatitude: number;
  spotLongitude: number;
  matchedAt: string;
  arrivalAt: string | null;
  etaMinutes?: number | null;
  departingUserId?: string;
  arrivingUserId?: string;
  role?: string;
  otherUserName?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(getStoredUser());
  const [view, setView] = useState<DashboardView>("main");
  const [match, setMatch] = useState<MatchData | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [searching, setSearching] = useState(false);
  const [offersFound, setOffersFound] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [billingLoading, setBillingLoading] = useState(false);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState("");
  const [matchHistory, setMatchHistory] = useState<MatchData[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [parkingMatchResult, setParkingMatchResult] = useState<any>(null);
  const [pmDemoLoading, setPmDemoLoading] = useState(false);

  const isPremium = user?.isPremium === true;

  useEffect(() => { if (!user) { router.push("/signup"); } }, [user, router]);

  useEffect(() => {
    fetchCurrentUser().then((u) => { if (u) setUser(u); });
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => { setGeoError("Using default location"); setPosition({ lat: 33.77, lng: -118.19 }); },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    } else { setGeoError("Geolocation not available"); setPosition({ lat: 33.77, lng: -118.19 }); }
    fetchMatchHistory();
    return () => stopPolling();
  }, []);

  useEffect(() => { if (countdown > 0) { const t = setTimeout(() => setCountdown((c) => c - 1), 1000); return () => clearTimeout(t); } }, [countdown]);

  async function fetchMatchHistory() { try { const { matches } = await api.get<{ matches: MatchData[] }>("/api/matches/my"); setMatchHistory(matches); } catch {} }
  function stopPolling() { if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; } }

  async function pollForMatch(offerId: string) {
    pollingRef.current = setInterval(async () => {
      try {
        const { matches: myMatches } = await api.get<{ matches: MatchData[] }>("/api/matches/my");
        const incoming = myMatches.find((m) => m.status === "active" && m.departingUserId === user?.id);
        if (incoming) { stopPolling(); setMatch(incoming); setView("matched"); setCountdown(600); }
      } catch {}
    }, 5000);
  }

  if (!user) return null;

  const handleLeaving = async () => {
    if (!position) { setError("Waiting for your location..."); return; }
    setView("leaving"); setSearching(true); setError("");
    try {
      const { offer } = await api.post<{ offer: { id: string } }>("/api/pairing/offer", {
        latitude: position.lat,
        longitude: position.lng,
        address: geoError ? "Long Beach, CA (approximate)" : "My current location",
        expectedDeparture: new Date(Date.now() + 30 * 60000).toISOString(),
        vehicleType: user.vehicleType || undefined,
        vehicleSize: user.vehicleSize || undefined,
      });
      setSearching(false); setView("waiting"); pollForMatch(offer.id);
    } catch { setError("Failed to create spot offer."); setTimeout(() => setView("main"), 2000); setSearching(false); }
  };

  const handleNeedSpot = async () => {
    if (!isPremium) { setView("upgrade-modal"); return; }
    if (!position) { setError("Waiting for your location..."); return; }
    setView("need-spot"); setSearching(true); setError("");
    try {
      const { offers } = await api.get<{ offers: any[] }>(`/api/pairing/find?lat=${position.lat}&lng=${position.lng}`);
      if (offers.length === 0) { setError("No spots available right now."); setTimeout(() => setView("main"), 2000); setSearching(false); return; }
      setOffersFound(offers);
      setSearching(false);
      setTimeout(async () => {
        const best = offers[0];
        try {
          const { match: newMatch } = await api.post<{ match: MatchData }>("/api/pairing/match", { offerId: best.id, arrivingUserId: user.id, lat: position.lat, lng: position.lng });
          setMatch(newMatch);
          setView("matched");
          if (newMatch.etaMinutes) setCountdown(newMatch.etaMinutes * 60);
          else setCountdown(600);
        } catch {
          setError("Failed to find a spot.");
          setTimeout(() => setView("main"), 2000);
        }
      }, 1500);
    } catch { setError("Failed to find a spot."); setTimeout(() => setView("main"), 2000); }
  };

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

  const handleAccept = async () => { if (!match) return; try { await api.post("/api/pairing/accept", { matchId: match.id, action: "accept" }); setMatch(null); setView("main"); } catch { setError("Failed to accept match."); } };
  const handleCancel = async () => { if (!match) return; try { await api.post("/api/pairing/accept", { matchId: match.id, action: "cancel" }); setMatch(null); setView("main"); } catch { setError("Failed to cancel match."); } };
  const handleBack = () => { stopPolling(); setView("main"); setMatch(null); };
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
          <a href="/" className="text-lg font-bold tracking-tight"><span className="text-[#4285F4]">Parking</span> <span className="text-[#0F9D58]">Agent</span></a>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-[#757575] hidden sm:inline">{user.name}</span>
            {isPremium && <Badge variant="success">Premium</Badge>}
            <a href="/profile" className="text-[#4285F4] hover:underline">Profile</a>
            <a href="/premium" className={`hover:underline ${isPremium ? "text-[#757575]" : "text-[#F9A825] font-semibold"}`}>Premium</a>
            {user.membershipType && user.membershipType !== "none" && (
              <button onClick={async () => { setBillingLoading(true); try { const { url } = await api.post<{ url: string }>("/api/stripe/portal"); window.location.href = url; } catch { alert("Billing portal not available."); } setBillingLoading(false); }} disabled={billingLoading}
                className="text-xs bg-gray-100 text-[#757575] px-3 py-1.5 rounded-lg hover:bg-gray-200">{billingLoading ? "..." : "Billing"}</button>
            )}
            <button onClick={() => { localStorage.removeItem("parking_agent_auth"); router.push("/"); }} className="text-[#E94335] hover:underline ml-1">Sign out</button>
          </div>
        </div>
      </nav>

      <main className="max-w-lg mx-auto px-4 py-10">
        {/* Status Badge */}
        <div className="text-center mb-8">
          <Badge variant={user.isMember ? "success" : user.status === "pending" ? "warning" : "error"}>
            {user.isMember ? "Membership Active" : user.status === "pending" ? "Pending — Complete Courses" : "Membership Inactive"}
          </Badge>
          {isPremium && (
            <p className="text-[10px] text-[#0F9D58] mt-1 font-semibold">Premium Plan — Real-time matching active</p>
          )}
        </div>

        {view === "main" && (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#202124]">Welcome, {user.name.split(" ")[0]}</h1>
            <p className="text-sm text-[#757575] mt-1">What would you like to do?</p>

            {error && <p className="text-sm text-[#E94335] mt-3">{error}</p>}
            {geoError && <p className="text-[10px] text-[#757575] mt-1">{geoError}</p>}

            <div className="mt-8 space-y-3">
              {/* I'm Leaving (free for all) */}
              <button onClick={handleLeaving} disabled={!position}
                className="w-full bg-[#4285F4] text-white px-6 py-5 rounded-xl font-bold text-base shadow-sm hover:bg-[#1A73E8] transition-colors disabled:opacity-50 flex items-center justify-center gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M13 12H3" /></svg>
                I'm Leaving
              </button>
              {/* I Need a Spot (Premium only) */}
              <button onClick={handleNeedSpot} disabled={!position}
                className="w-full border-2 border-[#0F9D58] text-[#0F9D58] px-6 py-5 rounded-xl font-bold text-base hover:bg-[#E6F4EA] transition-colors disabled:opacity-50 flex items-center justify-center gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                I'm Looking for a Spot
                {!isPremium && <span className="text-[10px] bg-[#F9A825] text-white px-1.5 py-0.5 rounded font-semibold">Premium</span>}
              </button>
              {/* Free schedule-based matching (demo) */}
              <button onClick={handleParkingMatchDemo}
                className="w-full bg-[#FBBB05] text-[#202124] px-6 py-5 rounded-xl font-bold text-base shadow-sm hover:bg-[#F9A825] transition-colors flex items-center justify-center gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>
                Try Free Schedule Matching
              </button>
            </div>

            <p className="text-[10px] text-[#757575] mt-3">
              {isPremium ? "Real-time features active" : 'Schedule matching is free. Real-time "I Need a Spot" requires Premium.'}
            </p>

            {/* Ranking */}
            <Card className="mt-6 text-left">
              <h3 className="font-semibold text-xs text-[#202124] mb-2">Your Ranking</h3>
              <div className="flex items-center justify-between text-xs"><span className="text-[#757575]">Status</span><span className="text-[#0F9D58] font-semibold">Good Standing</span></div>
              <div className="flex items-center justify-between text-xs mt-1"><span className="text-[#757575]">Score</span><span className="text-[#202124] font-semibold">50</span></div>
            </Card>

            <div className="mt-4"><ReferralSection /></div>

            <PushNotifications />

            {/* Match History */}
            {matchHistory.length > 0 && (
              <div className="mt-6">
                <button onClick={() => setShowHistory(!showHistory)} className="text-xs text-[#4285F4] hover:underline font-medium">{showHistory ? "Hide" : "Show"} Match History ({matchHistory.length})</button>
                {showHistory && (
                  <div className="mt-2 space-y-1.5 text-left max-h-48 overflow-y-auto">
                    {matchHistory.slice().reverse().map((m) => (
                      <div key={m.id} className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-[10px]">
                        <div className="flex items-center justify-between">
                          <span className={`font-semibold capitalize ${
                            m.status === "completed" ? "text-[#0F9D58]" : m.status === "active" ? "text-[#4285F4]" : m.status === "cancelled" ? "text-[#E94335]" : "text-[#757575]"
                          }`}>{m.status}</span>
                          <span className="text-[#757575]">{new Date(m.matchedAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-[#757575] mt-0.5">
                          {m.role === "departing" ? "Matched with" : "Arrived at"}{" "}{m.otherUserName || "a member"}
                          {m.arrivalAt && ` — ${new Date(m.arrivalAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Upgrade Modal */}
        {view === "upgrade-modal" && (
          <div className="text-center animate-fade-in-up">
            <div className="w-16 h-16 bg-[#FFF3E0] rounded-full flex items-center justify-center mx-auto">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F9A825" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
            </div>
            <h2 className="text-xl font-bold text-[#202124] mt-4">Upgrade to Premium for Real-Time Parking</h2>
            <p className="text-sm text-[#757575] mt-2 max-w-xs mx-auto">
              The real-time &quot;I&apos;m looking for a spot&quot; service is a Premium feature.
            </p>
            <p className="text-sm text-[#757575] mt-1">
              Get instant matches with members leaving nearby, live ETA, and priority matching.
            </p>

            <div className="mt-6 space-y-2 text-left max-w-xs mx-auto">
              {["Live GPS-based ETA to available spots.", "Instant matches with members leaving now.", "Priority matching over free users.", "Live notifications for nearby spots."].map((benefit) => (
                <div key={benefit} className="flex items-start gap-2 text-xs">
                  <svg className="w-4 h-4 text-[#0F9D58] mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7" /></svg>
                  <span className="text-[#202124]">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-2">
              <button onClick={() => router.push("/premium")}
                className="w-full bg-[#F9A825] text-white px-6 py-4 rounded-xl font-bold text-base hover:bg-[#F59E0B] transition-colors">
                Upgrade to Premium
              </button>
              <button onClick={() => setView("main")}
                className="w-full border border-gray-300 text-[#757575] px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
                Maybe Later
              </button>
            </div>
          </div>
        )}

        {view === "leaving" && (
          <div className="text-center">
            <button onClick={handleBack} className="text-sm text-[#4285F4] hover:underline mb-6 inline-block">&larr; Back</button>
            <h2 className="text-xl font-bold text-[#202124]">You're Leaving</h2>
            <p className="text-sm text-[#757575] mt-1">Creating your spot offer...</p>
            {searching && <div className="mt-8"><div className="w-12 h-12 border-4 border-[#E8F0FE] border-t-[#4285F4] rounded-full animate-spin mx-auto" /><p className="text-sm text-[#757575] mt-4">Finding your location...</p></div>}
          </div>
        )}

        {view === "waiting" && (
          <div className="text-center">
            <button onClick={handleBack} className="text-sm text-[#4285F4] hover:underline mb-6 inline-block">&larr; Cancel</button>
            <h2 className="text-xl font-bold text-[#202124]">Spot Offered!</h2>
            <p className="text-sm text-[#757575] mt-1">Waiting for a nearby member to claim it...</p>
            <div className="mt-8"><div className="w-12 h-12 border-4 border-[#E8F0FE] border-t-[#0F9D58] rounded-full animate-spin mx-auto" /><p className="text-sm text-[#757575] mt-4">We'll notify you when matched.</p></div>
          </div>
        )}

        {view === "need-spot" && (
          <div className="text-center">
            <button onClick={handleBack} className="text-sm text-[#4285F4] hover:underline mb-6 inline-block">&larr; Back</button>
            <h2 className="text-xl font-bold text-[#202124]">Looking for a Spot</h2>
            <p className="text-sm text-[#757575] mt-1">
              {searching ? "Finding the best match near you..." : "Matching you with the best spot..."}
            </p>
            {searching && <div className="mt-8"><div className="w-12 h-12 border-4 border-[#E8F0FE] border-t-[#0F9D58] rounded-full animate-spin mx-auto" /><p className="text-sm text-[#757575] mt-4">Searching available spots...</p></div>}
            {!searching && offersFound.length > 0 && (
              <div className="mt-6 space-y-2 text-left">
                <p className="text-xs text-[#757575] font-medium mb-2">Available spots with ETA:</p>
                {offersFound.slice(0, 3).map((o, i) => (
                  <div key={o.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-[#202124]">Spot #{i + 1}</p>
                      <p className="text-[10px] text-[#757575]">{o.address || `${o.latitude?.toFixed(4)}, ${o.longitude?.toFixed(4)}`}</p>
                    </div>
                    <div className="text-right">
                      {o.etaMinutes ? (
                        <p className="text-xs font-bold text-[#0F9D58]">{o.etaMinutes} min ETA</p>
                      ) : (
                        <p className="text-xs text-[#757575]">Calculating...</p>
                      )}
                    </div>
                  </div>
                ))}
                <div className="mt-3"><div className="w-8 h-8 border-3 border-[#E8F0FE] border-t-[#4285F4] rounded-full animate-spin mx-auto" /></div>
              </div>
            )}
          </div>
        )}

        {view === "matched" && match && (
          <div className="text-center animate-match-pop">
            <div className="w-16 h-16 bg-[#E6F4EA] rounded-full flex items-center justify-center mx-auto">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0F9D58" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg>
            </div>
            <h2 className="text-xl font-bold text-[#202124] mt-3">You've been matched!</h2>
            <p className="text-sm text-[#757575] mt-1">Someone is leaving their spot around your arrival time.</p>

            <Card className="mt-5 text-left space-y-2">
              <div className="flex items-center justify-between text-xs"><span className="text-[#757575]">Spot Location</span>
                <a href={`https://maps.google.com/maps?q=${match.spotLatitude},${match.spotLongitude}`} target="_blank" rel="noopener noreferrer" className="text-[#4285F4] font-medium hover:underline">{match.spotLatitude.toFixed(4)}, {match.spotLongitude.toFixed(4)}</a></div>
              <div className="flex items-center justify-between text-xs"><span className="text-[#757575]">Status</span><Badge>{match.status}</Badge></div>
              <div className="flex items-center justify-between text-xs"><span className="text-[#757575]">ETA</span><span className="text-[#0F9D58] font-semibold">{match.etaMinutes ? `${match.etaMinutes} min` : "Calculating..."}</span></div>
              <div className="flex items-center justify-between text-xs"><span className="text-[#757575]">Countdown</span><span className="text-[#202124] font-semibold">{formatTime(countdown)}</span></div>
            </Card>

            <div className="mt-4"><MapView latitude={match.spotLatitude} longitude={match.spotLongitude} label="Parking spot" className="h-44" /></div>

            <div className="mt-5 space-y-2">
              <button onClick={handleAccept} className="w-full bg-[#0F9D58] text-white px-6 py-4 rounded-xl font-bold hover:bg-[#34A853] transition-colors">✓ Accept & Arrive</button>
              <button onClick={handleCancel} className="w-full border border-gray-300 text-[#757575] px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">Cancel Match</button>
            </div>
          </div>
        )}

        {view === "parking-match-demo" && (
          <div className="text-center animate-fade-in-up">
            {pmDemoLoading ? (
              <>
                <div className="w-16 h-16 border-4 border-[#FFF3E0] border-t-[#FBBB05] rounded-full animate-spin mx-auto" />
                <h2 className="text-xl font-bold text-[#202124] mt-4">Searching for a match...</h2>
                <p className="text-sm text-[#757575] mt-2">Creating demo data and running matching logic.</p>
              </>
            ) : parkingMatchResult ? (
              <>
                <div className="w-16 h-16 bg-[#FFF3E0] rounded-full flex items-center justify-center mx-auto">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F9A825" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg>
                </div>
                <h2 className="text-xl font-bold text-[#202124] mt-3">You've been matched!</h2>
                <p className="text-sm text-[#757575] mt-1">Someone is leaving their spot around your arrival time.</p>

                <Card className="mt-5 text-left space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#757575]">Matched with</span>
                    <span className="text-[#202124] font-semibold">{parkingMatchResult.anonymousPartner || "Member #DEMO"}</span>
                  </div>
                  {parkingMatchResult.partnerVehicleInfo && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#757575]">Vehicle</span>
                      <span className="text-[#202124] font-semibold">
                        {parkingMatchResult.partnerVehicleInfo.type || "car"} / {parkingMatchResult.partnerVehicleInfo.size || "standard"}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#757575]">Their leaving time</span>
                    <span className="text-[#4285F4] font-semibold">
                      {parkingMatchResult.leavingTime ? `${Math.floor(parkingMatchResult.leavingTime / 60).toString().padStart(2, "0")}:${(parkingMatchResult.leavingTime % 60).toString().padStart(2, "0")}` : "~08:10"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#757575]">Your arrival time</span>
                    <span className="text-[#0F9D58] font-semibold">
                      {parkingMatchResult.arrivalLookingTime ? `${Math.floor(parkingMatchResult.arrivalLookingTime / 60).toString().padStart(2, "0")}:${(parkingMatchResult.arrivalLookingTime % 60).toString().padStart(2, "0")}` : "~08:00"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#757575]">Status</span>
                    <Badge variant={parkingMatchResult.status === "confirmed" ? "success" : "warning"}>{parkingMatchResult.status}</Badge>
                  </div>
                </Card>

                <div className="mt-4 text-xs text-[#757575] bg-gray-50 border border-gray-200 rounded-xl p-3 text-left">
                  <p className="font-semibold text-[#202124] mb-1">How this matches your schedule</p>
                  <p>You submitted: leave at 17:30, arrive looking at 08:00.</p>
                  <p className="mt-1">Demo member: leaves at 08:10 (within 10 min of your arrival), arrives looking at 17:45 (within 15 min of your leave).</p>
                </div>

                <div className="mt-5 space-y-2">
                  <button onClick={() => router.push("/profile")}
                    className="w-full bg-[#4285F4] text-white px-6 py-4 rounded-xl font-bold hover:bg-[#1A73E8] transition-colors">
                    View All Matches in Profile
                  </button>
                  <button onClick={handleBack}
                    className="w-full border border-gray-300 text-[#757575] px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
                    Back to Dashboard
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-[#202124]">No match found</h2>
                <p className="text-sm text-[#757575] mt-2">Try setting up your schedule in your profile first.</p>
                <button onClick={handleBack} className="mt-4 text-sm text-[#4285F4] hover:underline">Back</button>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
