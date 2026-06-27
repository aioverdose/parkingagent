"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, fetchCurrentUser } from "@/lib/auth";
import { api } from "@/lib/api";
import MapView from "@/components/MapView";
import InteractiveMap from "@/components/InteractiveMap";
import PushNotifications from "@/components/PushNotifications";
import { ReferralSection } from "@/components/ReferralSection";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

type DashboardView = "main" | "leaving" | "need-spot" | "waiting" | "matched" | "parking-match-demo" | "upgrade-modal" | "arrival-drop-pin" | "arrival-searching" | "arrival-match-found" | "arrival-no-match";

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

interface PinPosition {
  lat: number;
  lng: number;
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

  // Tier 2 arrival state
  const [pinPosition, setPinPosition] = useState<PinPosition | null>(null);
  const [radiusIndex, setRadiusIndex] = useState(0);
  const [arrivalMatch, setArrivalMatch] = useState<any>(null);
  const [etaMinutes, setEtaMinutes] = useState<number>(0);

  const isPremium = user?.tier === "premium" || user?.tier === "free" || user?.isPremium === true;

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

  async function fetchMatchHistory() { try { const { matches } = await api.get<{ matches: MatchData[] }>("/api/matches/my"); setMatchHistory(matches); } catch { console.error("Failed to fetch match history"); } }
  function stopPolling() { if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; } }

  async function pollForMatch(offerId: string) {
    pollingRef.current = setInterval(async () => {
      try {
        const { matches: myMatches } = await api.get<{ matches: MatchData[] }>("/api/matches/my");
        const incoming = myMatches.find((m) => m.status === "active" && m.departingUserId === user?.id);
        if (incoming) { stopPolling(); setMatch(incoming); setView("matched"); setCountdown(600); }
      } catch { console.error("Failed to poll for match"); }
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
        address: geoError ? "Current location (approximate)" : "My current location",
        expectedDeparture: new Date(Date.now() + 30 * 60000).toISOString(),
        vehicleType: user.vehicleType || undefined,
        vehicleSize: user.vehicleSize || undefined,
      });
      setSearching(false); setView("waiting"); pollForMatch(offer.id);
    } catch { console.error("Failed to create spot offer"); setError("Failed to create spot offer."); setTimeout(() => setView("main"), 2000); setSearching(false); }
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
          console.error("Failed to match spot");
          setError("Failed to find a spot.");
          setTimeout(() => setView("main"), 2000);
        }
      }, 1500);
    } catch { console.error("Failed to find spots"); setError("Failed to find a spot."); setTimeout(() => setView("main"), 2000); }
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

  // Tier 2: Arrival — Drop a Pin
  const handleArrivalDropPin = () => {
    if (!isPremium) { setView("upgrade-modal"); return; }
    if (!position) { setError("Waiting for your location..."); return; }
    setView("arrival-drop-pin");
    setPinPosition(null);
    setRadiusIndex(0);
    setArrivalMatch(null);
    setError("");
  };

  const handlePinDrop = (lat: number, lng: number) => {
    setPinPosition({ lat, lng });
    if (position) {
      const dLat = ((lat - position.lat) * Math.PI) / 180;
      const dLng = ((lng - position.lng) * Math.PI) / 180;
      const a = Math.sin(dLat / 2) ** 2 + Math.cos((position.lat * Math.PI) / 180) * Math.cos((lng * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distMiles = 3959 * c;
      setEtaMinutes(Math.max(1, Math.round(distMiles * 30)));
    }
  };

  const handleStartSearch = async () => {
    if (!pinPosition) return;
    setView("arrival-searching");
    setRadiusIndex(0);
    setSearching(true);
    setError("");
    await doRadiusSearch(0);
  };

  const doRadiusSearch = async (rIndex: number) => {
    setRadiusIndex(rIndex);
    try {
      const result = await api.post<{
        found: boolean;
        match: any;
        radiusBlocks: number;
        canExpand: boolean;
        nextRadiusIndex: number | null;
        message: string;
      }>("/api/realtime/arrival", {
        latitude: pinPosition!.lat,
        longitude: pinPosition!.lng,
        expandRadius: rIndex,
      });

      if (result.found && result.match) {
        setArrivalMatch(result.match);
        setSearching(false);
        setView("arrival-match-found");
      } else if (result.canExpand && result.nextRadiusIndex !== null) {
        setTimeout(() => doRadiusSearch(result.nextRadiusIndex!), 2000);
      } else {
        setSearching(false);
        setView("arrival-no-match");
      }
    } catch {
      setSearching(false);
      setError("Search failed. Try again.");
      setTimeout(() => setView("main"), 2000);
    }
  };

  const handleAccept = async () => { if (!match) return; try { await api.post("/api/pairing/accept", { matchId: match.id, action: "accept" }); setMatch(null); setView("main"); } catch { setError("Failed to accept match."); } };
  const handleCancel = async () => { if (!match) return; try { await api.post("/api/pairing/accept", { matchId: match.id, action: "cancel" }); setMatch(null); setView("main"); } catch { setError("Failed to cancel match."); } };
  const handleBack = () => { stopPolling(); setView("main"); setMatch(null); };
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const RADII_LABELS = ["5 blocks", "10 blocks", "15 blocks", "20 blocks"];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 flex items-center justify-between h-20">
          <a href="/" className="text-2xl font-bold tracking-tight text-[#2563EB]">spotimization</a>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-[#64748B] hidden sm:inline">{user.name}</span>
            {isPremium && <Badge variant="success">Premium</Badge>}
            {(user as any).earlyAdopter && <Badge variant="info">1 Year Free</Badge>}
            <a href="/docs" className="text-[#64748B] font-medium hover:underline">Docs</a>
            <a href="/profile" className="text-[#2563EB] font-medium hover:underline">Profile</a>
            <a href="/premium" className={`font-medium hover:underline ${isPremium ? "text-[#64748B]" : "text-[#F59E0B] font-semibold"}`}>Premium</a>
            {user.membershipType && user.membershipType !== "none" && (
              <button onClick={async () => { setBillingLoading(true); try { const { url } = await api.post<{ url: string }>("/api/stripe/portal"); window.location.href = url; } catch { alert("Billing portal not available."); } setBillingLoading(false); }} disabled={billingLoading}
                className="text-xs bg-[#F1F5F9] text-[#64748B] px-3 py-1.5 rounded-lg font-medium hover:bg-[#E2E8F0]">{billingLoading ? "..." : "Billing"}</button>
            )}
            <button onClick={() => { localStorage.removeItem("spotimization_auth"); router.push("/"); }} className="text-[#EF4444] font-medium hover:underline ml-1">Sign out</button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <section className="modern-hero px-6 py-10 sm:px-10 sm:py-14 mb-8">
          <div className="relative z-10 max-w-3xl">
            <Badge variant="info" className="bg-white/15 text-white">Street Parking Assist</Badge>
            <h1 className="mt-5 text-4xl sm:text-5xl font-bold text-white">Find and hand off street parking with less circling.</h1>
            <p className="mt-4 text-lg sm:text-xl text-white/90 max-w-2xl">
              Real-time spot requests, anonymous schedule matching, and live arrival tracking in one clean member dashboard.
            </p>

          </div>
        </section>

        <div className="max-w-xl mx-auto">
        {/* Status Badge */}
        <div className="text-center mb-8">
          <Badge variant={user.isMember ? "success" : user.status === "pending" ? "warning" : "error"}>
            {user.isMember ? "Membership Active" : user.status === "pending" ? "Pending — Complete Courses" : "Membership Inactive"}
          </Badge>
          {isPremium && (
            <p className="text-[10px] text-[#10B981] mt-1 font-semibold">All features active — free forever</p>
          )}
          {(user as any).tier === "free" && (
            <div className="mt-3 bg-gradient-to-r from-[#DBEAFE] to-[#EDE9FE] border border-[#10B981]/20 rounded-xl p-3 text-xs text-left flex items-start gap-2">
              <span className="text-lg shrink-0">🏆</span>
              <div>
                <p className="font-semibold text-[#10B981]">Early Adopter — 1 Year Free</p>
                <p className="text-[#64748B] mt-0.5">You're one of the first 100 users! All features are unlocked free for one year. No monthly fees for 12 months.</p>
              </div>
            </div>
          )}
          {(user as any).tier === "premium_pending" && (
            <div className="mt-3 bg-gradient-to-r from-[#FEF3C7] to-[#FFFBEB] border border-[#F59E0B]/30 rounded-xl p-3 text-xs text-left">
              <p className="font-semibold text-[#F59E0B]">Subscribe to activate your account 🚀</p>
              <p className="text-[#64748B] mt-1">The first 100 free spots are filled. <strong>$4.99/month</strong> gives you unlimited schedule matching + real-time premium features.</p>
              <a href="/premium" className="mt-2 inline-block bg-[#F59E0B] text-white px-4 py-1.5 rounded-lg font-semibold text-xs">Subscribe Now</a>
            </div>
          )}
        </div>

        {view === "main" && (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#1E293B]">Welcome, {user.name.split(" ")[0]}</h1>
            <p className="text-sm text-[#64748B] mt-1">What would you like to do?</p>

            {error && <p className="text-sm text-[#EF4444] mt-3">{error}</p>}
            {geoError && <p className="text-[10px] text-[#64748B] mt-1">{geoError}</p>}

            <div className="mt-8 space-y-4 modern-card text-left">
              {/* Tier 1: Free schedule-based matching */}
              <button onClick={handleParkingMatchDemo}
                className="w-full bg-[#F59E0B] text-white px-7 py-4 rounded-lg font-semibold text-base shadow-[0_4px_12px_rgba(245,158,11,0.3)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.4)] hover:-translate-y-0.5 hover:bg-[#D97706] transition-all duration-300 flex items-center justify-center gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>
                Try Free Schedule Matching (Set your times)
              </button>
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

            {/* Match History */}
            {matchHistory.length > 0 && (
              <div className="mt-6">
                <button onClick={() => setShowHistory(!showHistory)} className="text-xs text-[#2563EB] font-medium hover:underline">{showHistory ? "Hide" : "Show"} Match History ({matchHistory.length})</button>
                {showHistory && (
                  <div className="mt-2 space-y-1.5 text-left max-h-48 overflow-y-auto">
                    {matchHistory.slice().reverse().map((m) => (
                      <div key={m.id} className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-3 text-[10px]">
                        <div className="flex items-center justify-between">
                          <span className={`font-semibold capitalize ${
                            m.status === "completed" ? "text-[#059669]" : m.status === "active" ? "text-[#2563EB]" : m.status === "cancelled" ? "text-[#DC2626]" : "text-[#64748B]"
                          }`}>{m.status}</span>
                          <span className="text-[#64748B]">{new Date(m.matchedAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-[#64748B] mt-0.5">
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
            <div className="w-16 h-16 bg-[#FEF3C7] rounded-full flex items-center justify-center mx-auto">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
            </div>
            <h2 className="text-xl font-bold text-[#1E293B] mt-4">Upgrade to Premium for Real-Time Parking</h2>
            <p className="text-sm text-[#64748B] mt-2 max-w-xs mx-auto">
              Real-time parking with GPS-based ETA and expanding radius alerts is a Premium feature.
            </p>

            <div className="mt-6 space-y-2 text-left max-w-xs mx-auto">
              {[
                "Drop a pin on the map of where you're arriving.",
                "System calculates ETA based on GPS.",
                "Schedule requests sent to matching users in your area.",
                "Alerts expand in radius as you get closer if no match found.",
                "Arrival beacon: send a beacon when arriving at an unscheduled time.",
              ].map((benefit) => (
                <div key={benefit} className="flex items-start gap-2 text-xs">
                  <svg className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7" /></svg>
                  <span className="text-[#1E293B]">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-2">
              <button onClick={() => router.push("/premium")}
                className="w-full bg-[#F59E0B] text-white px-6 py-4 rounded-2xl font-bold text-base shadow-[0_4px_12px_rgba(245,158,11,0.3)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.4)] hover:-translate-y-0.5 hover:bg-[#D97706] transition-all duration-200">
                Upgrade to Premium ($4.99/month)
              </button>
              <button onClick={() => setView("main")}
                className="w-full bg-white text-[#2563EB] border-2 border-[#2563EB] font-semibold rounded-2xl hover:bg-[#DBEAFE] px-6 py-3 text-sm transition-all duration-200">
                Maybe Later
              </button>
            </div>
          </div>
        )}

        {view === "leaving" && (
          <div className="text-center">
            <button onClick={handleBack} className="text-sm text-[#2563EB] font-medium hover:underline mb-6 inline-block">&larr; Back</button>
            <h2 className="text-xl font-bold text-[#1E293B]">You're Leaving</h2>
            <p className="text-sm text-[#64748B] mt-1">Creating your spot offer...</p>
            {searching && <div className="mt-8"><div className="w-12 h-12 border-4 border-[#DBEAFE] border-t-[#2563EB] rounded-full animate-spin mx-auto" /><p className="text-sm text-[#64748B] mt-4">Finding your location...</p></div>}
          </div>
        )}

        {view === "waiting" && (
          <div className="text-center">
            <button onClick={handleBack} className="text-sm text-[#2563EB] font-medium hover:underline mb-6 inline-block">&larr; Cancel</button>
            <h2 className="text-xl font-bold text-[#1E293B]">Spot Offered!</h2>
            <p className="text-sm text-[#64748B] mt-1">Waiting for a nearby member to claim it...</p>
            <div className="mt-8"><div className="w-12 h-12 border-4 border-[#D1FAE5] border-t-[#10B981] rounded-full animate-spin mx-auto" /><p className="text-sm text-[#64748B] mt-4">We'll notify you when matched.</p></div>
          </div>
        )}

        {view === "need-spot" && (
          <div className="text-center">
            <button onClick={handleBack} className="text-sm text-[#2563EB] font-medium hover:underline mb-6 inline-block">&larr; Back</button>
            <h2 className="text-xl font-bold text-[#1E293B]">Looking for a Spot</h2>
            <p className="text-sm text-[#64748B] mt-1">
              {searching ? "Finding the best match near you..." : "Matching you with the best spot..."}
            </p>
            {searching && <div className="mt-8"><div className="w-12 h-12 border-4 border-[#D1FAE5] border-t-[#10B981] rounded-full animate-spin mx-auto" /><p className="text-sm text-[#64748B] mt-4">Searching available spots...</p></div>}
            {!searching && offersFound.length > 0 && (
              <div className="mt-6 space-y-2 text-left">
                <p className="text-xs text-[#64748B] font-medium mb-2">Available spots with ETA:</p>
                {offersFound.slice(0, 3).map((o, i) => (
                  <div key={o.id} className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-[#1E293B]">Spot #{i + 1}</p>
                      <p className="text-[10px] text-[#64748B]">{o.address || `${o.latitude?.toFixed(4)}, ${o.longitude?.toFixed(4)}`}</p>
                    </div>
                    <div className="text-right">
                      {o.etaMinutes ? (
                        <p className="text-xs font-bold text-[#10B981]">{o.etaMinutes} min ETA</p>
                      ) : (
                        <p className="text-xs text-[#64748B]">Calculating...</p>
                      )}
                    </div>
                  </div>
                ))}
                <div className="mt-3"><div className="w-8 h-8 border-3 border-[#DBEAFE] border-t-[#2563EB] rounded-full animate-spin mx-auto" /></div>
              </div>
            )}
          </div>
        )}

        {view === "matched" && match && (
          <div className="text-center animate-match-pop">
            <div className="w-16 h-16 bg-[#D1FAE5] rounded-full flex items-center justify-center mx-auto">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg>
            </div>
            <h2 className="text-xl font-bold text-[#1E293B] mt-3">You've been matched!</h2>
            <p className="text-sm text-[#64748B] mt-1">Someone is leaving their spot around your arrival time.</p>

            <Card className="mt-5 text-left space-y-2">
              <div className="flex items-center justify-between text-xs"><span className="text-[#64748B]">Spot Location</span>
                <a href={`https://maps.google.com/maps?q=${match.spotLatitude},${match.spotLongitude}`} target="_blank" rel="noopener noreferrer" className="text-[#2563EB] font-medium hover:underline">{match.spotLatitude.toFixed(4)}, {match.spotLongitude.toFixed(4)}</a></div>
              <div className="flex items-center justify-between text-xs"><span className="text-[#64748B]">Status</span><Badge>{match.status}</Badge></div>
              <div className="flex items-center justify-between text-xs"><span className="text-[#64748B]">ETA</span><span className="text-[#10B981] font-semibold">{match.etaMinutes ? `${match.etaMinutes} min` : "Calculating..."}</span></div>
              <div className="flex items-center justify-between text-xs"><span className="text-[#64748B]">Countdown</span><span className="text-[#1E293B] font-semibold">{formatTime(countdown)}</span></div>
            </Card>

            <div className="mt-4"><MapView latitude={match.spotLatitude} longitude={match.spotLongitude} label="Parking spot" className="h-44" /></div>

            <div className="mt-5 space-y-2">
              <button onClick={handleAccept} className="w-full bg-[#10B981] text-white px-6 py-4 rounded-2xl font-bold shadow-[0_4px_12px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 hover:bg-[#059669] transition-all duration-200">✓ Accept & Arrive</button>
              <button onClick={handleCancel} className="w-full bg-white text-[#2563EB] border-2 border-[#2563EB] font-semibold rounded-2xl hover:bg-[#DBEAFE] px-6 py-3 text-sm transition-all duration-200">Cancel Match</button>
            </div>
          </div>
        )}

        {/* Tier 2: Arrival — Drop a Pin Map */}
        {view === "arrival-drop-pin" && (
          <div className="text-center">
            <button onClick={handleBack} className="text-sm text-[#2563EB] font-medium hover:underline mb-6 inline-block">&larr; Back</button>
            <h2 className="text-xl font-bold text-[#1E293B]">Drop a Pin</h2>
            <p className="text-sm text-[#64748B] mt-1">Drop a pin on the map where you are arriving.</p>

            <div className="mt-4 h-64">
              {position ? (
                <div className="w-full h-full relative">
                  <InteractiveMap
                    center={position}
                    onPinDrop={handlePinDrop}
                    className="h-64"
                  />
                  {pinPosition && (
                    <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur rounded-lg p-2 text-[10px] shadow-lg z-[1000]">
                      <p className="font-semibold text-[#1E293B]">Pin dropped</p>
                      <p className="text-[#64748B]">{pinPosition.lat.toFixed(4)}, {pinPosition.lng.toFixed(4)}</p>
                      <p className="text-[#10B981] font-semibold">ETA: ~{etaMinutes} minutes</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full bg-[#F1F5F9] rounded-xl flex items-center justify-center text-sm text-[#64748B]">
                  Acquiring GPS location...
                </div>
              )}
            </div>

            <button onClick={handleStartSearch} disabled={!pinPosition}
              className="mt-6 w-full bg-[#10B981] text-white px-6 py-4 rounded-2xl font-bold text-base shadow-[0_4px_12px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 hover:bg-[#059669] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
              Search for Matches
            </button>
          </div>
        )}

        {/* Tier 2: Searching for matches */}
        {view === "arrival-searching" && (
          <div className="text-center">
            <button onClick={handleBack} className="text-sm text-[#2563EB] font-medium hover:underline mb-6 inline-block">&larr; Cancel</button>
            <h2 className="text-xl font-bold text-[#1E293B]">Searching for matches in your area...</h2>
            <p className="text-sm text-[#64748B] mt-1">Checking radius: {RADII_LABELS[radiusIndex] || `${(radiusIndex + 1) * 5} blocks`}</p>
            <div className="mt-8">
              <div className="w-12 h-12 border-4 border-[#D1FAE5] border-t-[#10B981] rounded-full animate-spin mx-auto" />
              <p className="text-sm text-[#64748B] mt-4">Searching for matching schedules in your area...</p>
            </div>
          </div>
        )}

        {/* Tier 2: Match Found */}
        {view === "arrival-match-found" && arrivalMatch && (
          <div className="text-center animate-match-pop">
            <div className="w-16 h-16 bg-[#D1FAE5] rounded-full flex items-center justify-center mx-auto">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg>
            </div>
            <h2 className="text-xl font-bold text-[#1E293B] mt-3">Match Found!</h2>
            <p className="text-sm text-[#64748B] mt-1">Someone is departing around your ETA.</p>

            <Card className="mt-5 text-left space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#64748B]">Matched with</span>
                <span className="text-[#1E293B] font-semibold">{arrivalMatch.departingMemberNumber}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#64748B]">Vehicle</span>
                <span className="text-[#1E293B] font-semibold">{arrivalMatch.vehicleType} / {arrivalMatch.vehicleSize}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#64748B]">Your ETA</span>
                <span className="text-[#10B981] font-semibold">~{arrivalMatch.etaMinutes} minutes</span>
              </div>
              {arrivalMatch.address && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#64748B]">Location</span>
                  <span className="text-[#2563EB] font-semibold text-[10px]">{arrivalMatch.address}</span>
                </div>
              )}
            </Card>

            {arrivalMatch.spotLatitude && arrivalMatch.spotLongitude && (
              <div className="mt-4">
                <MapView latitude={arrivalMatch.spotLatitude} longitude={arrivalMatch.spotLongitude} label="Parking spot" className="h-44" />
              </div>
            )}

            <div className="mt-5 space-y-2">
              <button onClick={handleBack}
                className="w-full bg-[#10B981] text-white px-6 py-4 rounded-2xl font-bold shadow-[0_4px_12px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 hover:bg-[#059669] transition-all duration-200">
                ✓ Great, I'm On My Way
              </button>
            </div>
          </div>
        )}

        {/* Tier 2: No Match */}
        {view === "arrival-no-match" && (
          <div className="text-center">
            <div className="w-16 h-16 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M8 8l8 8M16 8l-8 8" /></svg>
            </div>
            <h2 className="text-xl font-bold text-[#1E293B] mt-3">No match found</h2>
            <p className="text-sm text-[#64748B] mt-2 max-w-xs mx-auto">
              No match found in your area. Try expanding the radius or set up a recurring schedule.
            </p>
            <div className="mt-6 space-y-2">
              <button onClick={() => router.push("/profile")}
                className="w-full bg-[#2563EB] text-white px-6 py-4 rounded-2xl font-bold text-base shadow-[0_4px_12px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)] hover:-translate-y-0.5 hover:bg-[#1D4ED8] transition-all duration-200">
                Try Free Schedule Matching
              </button>
              <button onClick={handleBack}
                className="w-full bg-white text-[#2563EB] border-2 border-[#2563EB] font-semibold rounded-2xl hover:bg-[#DBEAFE] px-6 py-3 text-sm transition-all duration-200">
                Back to Dashboard
              </button>
            </div>
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
                      {parkingMatchResult.leavingTime ? `${Math.floor(parkingMatchResult.leavingTime / 60).toString().padStart(2, "0")}:${(parkingMatchResult.leavingTime % 60).toString().padStart(2, "0")}` : "~08:10"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#64748B]">Your arrival time</span>
                    <span className="text-[#10B981] font-semibold">
                      {parkingMatchResult.arrivalLookingTime ? `${Math.floor(parkingMatchResult.arrivalLookingTime / 60).toString().padStart(2, "0")}:${(parkingMatchResult.arrivalLookingTime % 60).toString().padStart(2, "0")}` : "~08:00"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#64748B]">Status</span>
                    <Badge variant={parkingMatchResult.status === "confirmed" ? "success" : "warning"}>{parkingMatchResult.status}</Badge>
                  </div>
                </Card>

                <div className="mt-4 text-xs text-[#64748B] bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-3 text-left">
                  <p className="font-semibold text-[#1E293B] mb-1">How this matches your schedule</p>
                  <p>You submitted: leave at 17:30, arrive looking at 08:00.</p>
                  <p className="mt-1">Demo member: leaves at 08:10 (within 10 min of your arrival), arrives looking at 17:45 (within 15 min of your leave).</p>
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
