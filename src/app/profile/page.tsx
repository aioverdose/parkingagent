"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, fetchCurrentUser } from "@/lib/auth";
import { api } from "@/lib/api";
import { HoverButton } from "@/components/ui/HoverButton";
import { HoverCard } from "@/components/ui/HoverCard";
import { Badge } from "@/components/ui/Badge";
import InteractiveMap from "@/components/InteractiveMap";
import { neighborhoods, detectNeighborhood } from "@/lib/neighborhoods";

interface ParkingMatch {
  matchId: string;
  leavingMemberId: string;
  arrivingMemberId: string;
  leavingTime: number;
  arrivalLookingTime: number;
  toleranceMinutes: number;
  status: string;
  matchedAt: string;
  anonymousPartner: string;
  partnerVehicleInfo: { type: string | null; size: string | null } | null;
  partnerRanking?: number;
  ownRanking?: number;
  confirmed?: boolean;
  rated?: boolean;
  rating?: number;
}

interface BeaconRequest {
  id: string;
  departureTime: string;
  radius: number;
  status: string;
  matchedMemberId: string | null;
  createdAt: string;
}

interface PreScheduledConnection {
  id: string;
  neighborhoodName: string;
  schedulePattern: string;
  yourRole: "arriver" | "departor";
  status: string;
  nextOccurrence: string;
  anonymousPartner: string;
  partnerVehicleInfo: { type: string | null; size: string | null } | null;
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function RankingStars({ ranking }: { ranking: number }) {
  return (
    <span className="text-[#F9A825] text-xs">
      {"★".repeat(ranking)}{"☆".repeat(5 - ranking)}
    </span>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(getStoredUser());
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [gpsDetecting, setGpsDetecting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // New schedule form
  const [pinPosition, setPinPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [arrivalTime, setArrivalTime] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [carType, setCarType] = useState("");
  const [scheduleMessage, setScheduleMessage] = useState("");
  const [scheduleError, setScheduleError] = useState("");
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Existing match / beacon state
  const [parkingMatches, setParkingMatches] = useState<ParkingMatch[]>([]);
  const [preScheduledConnections, setPreScheduledConnections] = useState<PreScheduledConnection[]>([]);
  const [showMatches, setShowMatches] = useState(true);
  const [psRole, setPsRole] = useState<"arriver" | "departor" | "both">("both");
  const [psType, setPsType] = useState<"work" | "event" | "shift" | "other">("work");
  const [psDays, setPsDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [psArrivalStart, setPsArrivalStart] = useState("07:00");
  const [psArrivalEnd, setPsArrivalEnd] = useState("08:00");
  const [psDepartureStart, setPsDepartureStart] = useState("17:00");
  const [psDepartureEnd, setPsDepartureEnd] = useState("18:00");
  const [psFrequency, setPsFrequency] = useState<"daily" | "weekly" | "biweekly">("weekly");
  const [psStartDate, setPsStartDate] = useState("");
  const [psEndDate, setPsEndDate] = useState("");
  const [psMessage, setPsMessage] = useState("");
  const [psError, setPsError] = useState("");
  const [psLoading, setPsLoading] = useState(false);

  // Beacon
  const [beaconDepartureTime, setBeaconDepartureTime] = useState("");
  const [beaconMessage, setBeaconMessage] = useState("");
  const [beaconError, setBeaconError] = useState("");
  const [beaconLoading, setBeaconLoading] = useState(false);
  const [beacons, setBeacons] = useState<BeaconRequest[]>([]);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);

  // Post-match state
  const [ratingValue, setRatingValue] = useState<Record<string, number>>({});

  const isPremium = user?.tier === "premium" || user?.isPremium === true;
  const isFree1Year = user?.tier === "free_1year";

  useEffect(() => {
    if (!user) { router.push("/signup"); return; }
    fetchCurrentUser().then((u) => {
      if (u) {
        setUser(u); setName(u.name); setEmail(u.email);
        setNeighborhood(u.neighborhood || "");
      }
    });
    fetchParkingMatches();
    fetchPreScheduledConnections();
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setPosition({ lat: neighborhoods.defaultLat, lng: neighborhoods.defaultLng }),
        { enableHighAccuracy: true, timeout: 10000 },
      );
    } else {
      setPosition({ lat: neighborhoods.defaultLat, lng: neighborhoods.defaultLng });
    }
    registerServiceWorker();
    requestPushPermission();
  }, []);

  async function registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      try {
        await navigator.serviceWorker.register("/sw.js");
      } catch {}
    }
  }

  async function requestPushPermission() {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
            ? urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY)
            : undefined,
        });
        const sub = subscription.toJSON();
        await api.post("/api/push/subscribe", {
          endpoint: sub.endpoint,
          auth: sub.keys?.auth || "",
          p256dh: sub.keys?.p256dh || "",
        });
      }
    } catch {}
  }

  function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
  }

  async function fetchParkingMatches() {
    try {
      const { matches } = await api.get<{ matches: ParkingMatch[] }>("/api/parking-match/my-matches");
      setParkingMatches(matches);
    } catch { console.error("Failed to fetch parking matches"); }
  }

  async function fetchPreScheduledConnections() {
    try {
      const { connections } = await api.get<{ connections: PreScheduledConnection[] }>("/api/matching/my-connections");
      setPreScheduledConnections(connections);
    } catch {}
  }

  async function fetchBeacons() {
    try {
      const { beacons } = await api.get<{ beacons: BeaconRequest[] }>("/api/beacon/my-beacons");
      setBeacons(beacons);
    } catch {}
  }

  const detectGpsNeighborhood = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    setGpsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const detected = detectNeighborhood(pos.coords.latitude, pos.coords.longitude);
        setNeighborhood(detected);
        setGpsDetecting(false);
      },
      () => setGpsDetecting(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(""); setError(""); setLoading(true);
    try {
      const { user: updated } = await api.put<{ user: any }>("/api/auth/profile", {
        name, email,
        neighborhood: neighborhood || undefined,
      });
      if (updated) {
        localStorage.setItem("spotimization_auth", JSON.stringify(updated));
        setUser(updated);
        setMessage("Profile updated successfully");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    }
    setLoading(false);
  }

  async function handleScheduleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setScheduleMessage(""); setScheduleError("");
    if (!pinPosition) { setScheduleError("Please drop a pin on the map for your desired parking location."); return; }
    if (!arrivalTime) { setScheduleError("Please enter your arrival time."); return; }
    if (!departureTime) { setScheduleError("Please enter your departure time."); return; }
    if (!carType) { setScheduleError("Please select your car type."); return; }
    setScheduleLoading(true);
    try {
      const anonymizedLocation = {
        lat: Math.round(pinPosition.lat * 1000) / 1000,
        lng: Math.round(pinPosition.lng * 1000) / 1000,
      };
      const { message } = await api.post<{ message: string }>("/api/parking-match-schedule", {
        leavingTime: departureTime,
        arrivalLookingTime: arrivalTime,
        latitude: anonymizedLocation.lat,
        longitude: anonymizedLocation.lng,
        carType,
      });
      setScheduleMessage(message);
      setSubmitted(true);
      fetchParkingMatches();
    } catch (err: any) {
      setScheduleError(err.message || "Failed to submit schedule.");
    }
    setScheduleLoading(false);
  }

  async function handleConfirmMatch(matchId: string) {
    try {
      await api.post("/api/parking-match/confirm", { matchId });
      fetchParkingMatches();
    } catch (err: any) {
      setError(err?.message || "Failed to confirm match.");
    }
  }

  async function handleCancelMatch(matchId: string) {
    try {
      await api.post("/api/parking-match/cancel", { matchId });
      await api.post("/api/ranking/update", { action: "cancel" });
      fetchParkingMatches();
    } catch (err: any) {
      setError(err?.message || "Failed to cancel match.");
    }
  }

  async function handleConfirmParking(matchId: string, success: boolean) {
    try {
      await api.post("/api/parking/confirm", { matchId, success });
      fetchParkingMatches();
    } catch {}
  }

  async function handleRateMatch(matchId: string, rating: number) {
    try {
      await api.post("/api/parking/rate", { matchId, rating });
      setRatingValue((prev) => ({ ...prev, [matchId]: rating }));
      fetchParkingMatches();
    } catch {}
  }

  async function handleFavoriteMatch(matchId: string) {
    try {
      await api.post("/api/parking/favorite", { matchId });
    } catch {}
  }

  function timeToMinutes(value: string) {
    const [h, m] = value.split(":").map(Number);
    return h * 60 + m;
  }

  function toggleScheduleDay(day: number) {
    setPsDays((current) => current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day].sort((a, b) => a - b));
  }

  async function handlePreScheduledSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPsMessage(""); setPsError("");
    if (!neighborhood.trim()) {
      setPsError("Add a neighborhood before submitting a pre-scheduled connection.");
      return;
    }
    if (psDays.length === 0) {
      setPsError("Choose at least one day of the week.");
      return;
    }

    setPsLoading(true);
    try {
      const { message } = await api.post<{ message: string }>("/api/schedules", {
        neighborhoodId: neighborhood.trim().toLowerCase().replace(/\s+/g, "-"),
        neighborhoodName: neighborhood.trim(),
        scheduleType: psType,
        daysOfWeek: psDays,
        arrivalWindowStart: timeToMinutes(psArrivalStart),
        arrivalWindowEnd: timeToMinutes(psArrivalEnd),
        departureWindowStart: timeToMinutes(psDepartureStart),
        departureWindowEnd: timeToMinutes(psDepartureEnd),
        frequency: psFrequency,
        startDate: psStartDate || null,
        endDate: psEndDate || null,
        role: psRole,
      });
      setPsMessage(message);
      await api.post("/api/matching/run-for-neighborhood", {
        neighborhoodId: neighborhood.trim().toLowerCase().replace(/\s+/g, "-"),
      });
      fetchPreScheduledConnections();
    } catch (err: any) {
      setPsError(err.message || "Failed to submit pre-scheduled connection.");
    }
    setPsLoading(false);
  }

  async function handlePreScheduledAction(matchId: string, action: "confirm" | "cancel") {
    try {
      await api.post(`/api/matching/${action}/${matchId}`);
      fetchPreScheduledConnections();
    } catch {
      setPsError(`Failed to ${action} connection.`);
    }
  }

  async function handleBeaconSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBeaconMessage(""); setBeaconError("");
    if (!beaconDepartureTime || !position) {
      setBeaconError("Arrival time and location are required.");
      return;
    }
    setBeaconLoading(true);
    try {
      const { message, beaconId } = await api.post<{ message: string; beaconId: string }>("/api/beacon/activate", {
        departureTime: beaconDepartureTime,
        latitude: position.lat,
        longitude: position.lng,
      });
      setBeaconMessage(message);
      setBeaconDepartureTime("");
      fetchBeacons();
      setTimeout(async () => {
        try {
          await api.post("/api/beacon/search", { beaconId });
          fetchBeacons();
        } catch {}
      }, 2000);
    } catch (err: any) {
      setBeaconError(err.message || "Failed to send beacon.");
    }
    setBeaconLoading(false);
  }

  const matchStats = {
    total: parkingMatches.length,
    confirmed: parkingMatches.filter((m) => m.status === "confirmed").length,
    cancelled: parkingMatches.filter((m) => m.status === "cancelled").length,
    pending: parkingMatches.filter((m) => m.status === "pending").length,
    rated: parkingMatches.filter((m) => m.rated).length,
    avgRating: parkingMatches.filter((m) => m.rating).reduce((a, b) => a + (b.rating || 0), 0) /
      Math.max(parkingMatches.filter((m) => m.rating).length, 1),
  };

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between max-w-5xl mx-auto px-4 sm:px-8 h-20">
          <a href="/" className="text-2xl font-bold tracking-tight text-[#2563EB]">spotimization</a>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#757575]">{user.name}</span>
            {isPremium && <Badge variant="success">Premium</Badge>}
              {isFree1Year && <Badge variant="success">1 Year Free</Badge>}
            {user.signupNumber && user.signupNumber <= 100 && (
              <Badge variant="info">Early Adopter</Badge>
            )}
            <button onClick={() => router.push("/dashboard")}
              className="text-sm text-[#4285F4] hover:underline">Dashboard</button>
            <button onClick={() => router.push("/docs")}
              className="text-sm text-[#4285F4] hover:underline">Docs</button>
          </div>
        </div>
      </nav>

      <main className="flex-1 px-4 sm:px-8 py-10">
        <div className="w-full max-w-2xl mx-auto space-y-10">
          <section className="modern-hero px-6 py-10 sm:px-10 text-center">
            <div className="relative z-10">
              <h1 className="text-4xl sm:text-5xl font-bold text-white">Parking Profile</h1>
              <p className="text-white/90 mt-3 text-lg">Manage vehicle details, schedules, rankings, and recurring anonymous connections.</p>
            </div>
          </section>

          {/* Profile Settings */}
          <div className="modern-card">
            <h1 className="text-2xl font-bold text-[#111827] text-center">Your Parking Profile</h1>
            <p className="text-[#4B5563] text-center mt-2 text-base">Update your information and set up your parking schedule</p>

            <form onSubmit={handleProfileSubmit} className="mt-8 space-y-4">
              {message && <p className="text-sm text-[#0F9D58] bg-[#E6F4EA] p-3 rounded-xl">{message}</p>}
              {error && <p className="text-sm text-[#E94335] bg-[#FCE8E6] p-3 rounded-xl">{error}</p>}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#202124] mb-1">Name</label>
                <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] outline-none" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#202124] mb-1">Email</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#202124] mb-1">Neighborhood</label>
                <div className="flex gap-2">
                  <select id="neighborhood" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] outline-none bg-white appearance-none">
                    <option value="">Select your neighborhood...</option>
                    {neighborhoods.neighborhoods.map((n) => (
                      <option key={n.id} value={n.name}>{n.name}</option>
                    ))}
                    <option value={neighborhoods.defaultCity}>{neighborhoods.defaultCity} (other)</option>
                  </select>
                  <button type="button" onClick={detectGpsNeighborhood} disabled={gpsDetecting}
                    className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm text-[#4285F4] hover:bg-[#E8F0FE] transition-colors disabled:opacity-50 whitespace-nowrap">
                    {gpsDetecting ? "\u23F3" : "\uD83D\uDCCD"}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-[#4285F4] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#1A73E8] transition-colors disabled:opacity-50">
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>

          {/* Map + Schedule Section */}
          <hr className="mb-2" />
          <div className="modern-card">
            <h2 className="text-lg font-semibold text-[#202124] mb-1">{"\uD83D\uDDFA\uFE0F"} Parking Schedule</h2>
            <p className="text-xs text-[#757575] mb-4">Set your schedule and drop a pin for your desired parking area</p>

            {position && (
              <InteractiveMap
                center={position}
                onPinDrop={(lat, lng) => setPinPosition({ lat, lng })}
                className="w-full h-64 mb-4"
              />
            )}

            {pinPosition && (
              <p className="text-xs text-[#0F9D58] mb-4">
                Pin placed: {pinPosition.lat.toFixed(4)}, {pinPosition.lng.toFixed(4)}
              </p>
            )}

            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              {scheduleMessage && <p className="text-sm text-[#0F9D58] bg-[#E6F4EA] p-3 rounded-xl">{scheduleMessage}</p>}
              {scheduleError && <p className="text-sm text-[#E94335] bg-[#FCE8E6] p-3 rounded-xl">{scheduleError}</p>}

              {submitted ? (
                <div className="bg-[#E6F4EA] border border-[#0F9D58]/30 rounded-xl p-4 text-center">
                  <p className="font-bold text-[#0F9D58]">{"\u2705"} Your schedule is set!</p>
                  <p className="text-sm text-[#757575] mt-2">
                    You will receive a notification when a match is found!<br />
                    We'll analyze your schedule and find someone with the opposite schedule.<br />
                    Both you and they will get a notification to accept the match.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label htmlFor="arrivalTime" className="block text-sm font-medium text-[#202124] mb-1">{"\u23F0"} Arrival Time (when you need parking)</label>
                    <input id="arrivalTime" type="time" value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] outline-none" />
                  </div>
                  <div>
                    <label htmlFor="departureTime" className="block text-sm font-medium text-[#202124] mb-1">{"\uD83D\uDE97"} Departure Time (when you leave)</label>
                    <input id="departureTime" type="time" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] outline-none" />
                  </div>
                  <div>
                    <label htmlFor="carType" className="block text-sm font-medium text-[#202124] mb-1">{"\uD83D\uDE99"} Car Type</label>
                    <select id="carType" value={carType} onChange={(e) => setCarType(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] outline-none bg-white">
                      <option value="">Select your car type</option>
                      <option value="small">Small Car (Honda Civic, Toyota Corolla)</option>
                      <option value="standard">Standard Car (Ford F-150, SUV)</option>
                      <option value="large">Large Vehicle (Truck, Van, RV)</option>
                    </select>
                  </div>
                  <HoverButton type="submit" disabled={scheduleLoading} className="w-full">
                    {scheduleLoading ? "Submitting..." : "Submit and Receive Matches"}
                  </HoverButton>
                </>
              )}
            </form>
          </div>

          {/* Arrival Beacon */}
          <hr className="mb-2" />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-semibold text-[#202124]">Arrival Beacon</h2>
            </div>
            <p className="text-xs text-[#757575] mb-4">
              If you are arriving at an unscheduled time we will send a beacon to find any matches.
            </p>
            <form onSubmit={handleBeaconSubmit} className="space-y-4">
              {beaconMessage && <p className="text-sm text-[#0F9D58] bg-[#E6F4EA] p-3 rounded-xl">{beaconMessage}</p>}
              {beaconError && <p className="text-sm text-[#E94335] bg-[#FCE8E6] p-3 rounded-xl">{beaconError}</p>}
              <div>
                <label htmlFor="beaconDepartureTime" className="block text-sm font-medium text-[#202124] mb-1">Arrival time</label>
                <input id="beaconDepartureTime" type="time" value={beaconDepartureTime} onChange={(e) => setBeaconDepartureTime(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] outline-none" />
              </div>
              <HoverButton type="submit" disabled={beaconLoading} className="w-full">
                {beaconLoading ? "Sending..." : "Send Beacon"}
              </HoverButton>
            </form>
            {beacons.length > 0 && (
              <div className="mt-6 space-y-2">
                <h3 className="font-semibold text-sm text-[#202124]">Your beacon requests</h3>
                {beacons.slice().reverse().map((b) => {
                  const statusVariant = b.status === "matched" ? "success" : b.status === "expired" ? "error" : "warning";
                  return (
                    <HoverCard key={b.id} className="text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant={statusVariant}>{b.status}</Badge>
                        <span className="text-[10px] text-[#757575]">Radius: {b.radius} blocks</span>
                      </div>
                      <div className="space-y-0.5 text-[#757575]">
                        <p><span className="text-[#202124] font-medium">Arrival time:</span> {b.departureTime}</p>
                        <p><span className="text-[#202124] font-medium">Created:</span> {new Date(b.createdAt).toLocaleDateString()}</p>
                        {b.matchedMemberId && <p><span className="text-[#0F9D58] font-medium">Matched with:</span> Member #{b.matchedMemberId.slice(0, 4).toUpperCase()}</p>}
                      </div>
                    </HoverCard>
                  );
                })}
              </div>
            )}
          </div>

          {/* Your Matches */}
          {parkingMatches.length > 0 && (
            <div>
              <hr className="mb-4" />
              <h2 className="text-lg font-semibold text-[#202124] mb-3">{"\uD83D\uDD14"} Your Matches</h2>
              <div className="space-y-3">
                {parkingMatches.map((m) => {
                  const isLeaver = m.leavingMemberId === user?.id;
                  const statusVariant = m.status === "confirmed" ? "success" : m.status === "cancelled" ? "error" : "warning";
                  const needsConfirm = Date.now() / 60000 > m.arrivalLookingTime && m.status === "confirmed" && !m.confirmed;
                  const needsRating = m.confirmed && !m.rated && !ratingValue[m.matchId];
                  const hasRated = m.rated || ratingValue[m.matchId] > 0;

                  return (
                    <HoverCard key={m.matchId} className="text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant={statusVariant}>{m.status}</Badge>
                        <span className="text-[#4285F4] font-medium">{m.anonymousPartner}</span>
                      </div>
                      <div className="space-y-0.5 text-[#757575]">
                        <p><span className="text-[#202124] font-medium">{isLeaver ? "You leave" : "Partner leaves"}:</span> {formatTime(m.leavingTime)}</p>
                        <p><span className="text-[#202124] font-medium">{isLeaver ? "Partner arrives" : "You arrive"}:</span> {formatTime(m.arrivalLookingTime)}</p>
                        {m.partnerVehicleInfo && (m.partnerVehicleInfo.type || m.partnerVehicleInfo.size) && (
                          <p><span className="text-[#202124] font-medium">Vehicle:</span> {m.partnerVehicleInfo.type || "any"} / {m.partnerVehicleInfo.size || "any"}</p>
                        )}
                        <p><span className="text-[#202124] font-medium">Matched:</span> {new Date(m.matchedAt).toLocaleDateString()}</p>

                        {m.status === "pending" && (
                          <div className="flex gap-2 mt-1.5">
                            <button onClick={() => handleConfirmMatch(m.matchId)}
                              className="text-[10px] bg-[#0F9D58] text-white px-2.5 py-1 rounded-lg font-medium hover:bg-[#34A853]">Accept</button>
                            <button onClick={() => handleCancelMatch(m.matchId)}
                              className="text-[10px] border border-gray-300 text-[#757575] px-2.5 py-1 rounded-lg font-medium hover:bg-gray-50">Decline</button>
                          </div>
                        )}

                        {/* Live Track Button */}
                        {m.status === "confirmed" && (
                          <div className="mt-1.5">
                            <button onClick={() => router.push(`/live/${m.matchId}`)}
                              className="text-[10px] bg-[#4285F4] text-white px-2.5 py-1 rounded-lg font-medium hover:bg-[#1A73E8] w-full">
                              {"\uD83D\uDCCD"} Live Track
                            </button>
                          </div>
                        )}

                        {/* Post-match parking confirmation */}
                        {m.status === "confirmed" && m.confirmed === false && (
                          <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="font-semibold text-[#202124] mb-2">Did you successfully park?</p>
                            <div className="flex gap-2">
                              <button onClick={() => handleConfirmParking(m.matchId, true)}
                                className="text-xs bg-[#0F9D58] text-white px-3 py-1.5 rounded-lg hover:bg-[#34A853]">Yes {"\u2705"}</button>
                              <button onClick={() => handleConfirmParking(m.matchId, false)}
                                className="text-xs bg-[#E94335] text-white px-3 py-1.5 rounded-lg hover:bg-[#c62828]">No {"\u274C"}</button>
                            </div>
                          </div>
                        )}

                        {/* Rating */}
                        {m.confirmed && !m.rated && !ratingValue[m.matchId] && (
                          <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <p className="font-semibold text-[#202124] mb-2">How was your match with {m.anonymousPartner}?</p>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} onClick={() => handleRateMatch(m.matchId, star)}
                                  className="text-lg hover:scale-110 transition-transform">
                                  {star <= (ratingValue[m.matchId] || 0) ? "\u2B50" : "\u2606"}
                                </button>
                              ))}
                            </div>
                            <button onClick={() => handleFavoriteMatch(m.matchId)}
                              className="mt-2 text-xs text-[#4285F4] hover:underline">
                              {"\u2764\uFE0F"} Favorite this member
                            </button>
                          </div>
                        )}

                        {hasRated && (
                          <p className="text-[#0F9D58] font-medium mt-1">Rated: {"\u2B50".repeat(m.rating || ratingValue[m.matchId] || 0)}</p>
                        )}
                      </div>
                    </HoverCard>
                  );
                })}
              </div>
            </div>
          )}

          {/* Match History Summary */}
          {parkingMatches.length > 0 && (
            <div>
              <hr className="mb-4" />
              <div>
                <h2 className="text-lg font-semibold text-[#202124] mb-3">{"\uD83D\uDCCA"} Your Match History</h2>
                <div className="grid grid-cols-3 gap-2 text-center mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[#757575] text-[10px]">Previous Matches</p>
                    <p className="font-bold text-[#202124] text-lg">{matchStats.total}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[#757575] text-[10px]">Success Rate</p>
                    <p className="font-bold text-[#0F9D58] text-lg">
                      {matchStats.total > 0 ? Math.round((matchStats.confirmed / matchStats.total) * 100) : 0}%
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[#757575] text-[10px]">Rating</p>
                    <p className="font-bold text-[#202124] text-lg">
                      {matchStats.avgRating > 0 ? matchStats.avgRating.toFixed(1) : "-"}{matchStats.avgRating > 0 ? "\u2B50" : ""}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ranking Display */}
          <hr className="mb-2" />
          <div className="modern-card">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-lg font-semibold text-[#202124]">Your Ranking</h2>
                <p className="text-xs text-[#757575]">Higher ranking = higher match priority</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-[#202124]">{user.ranking || 5}</div>
                <RankingStars ranking={user.ranking || 5} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
              <div className="bg-gray-50 rounded-lg p-2"><span className="text-[#757575]">Matches</span><p className="font-bold text-[#202124]">{user.matchCount || 0}</p></div>
              <div className="bg-gray-50 rounded-lg p-2"><span className="text-[#757575]">Cancels</span><p className="font-bold text-[#E94335]">{user.cancelCount || 0}</p></div>
              <div className="bg-gray-50 rounded-lg p-2"><span className="text-[#757575]">No-Shows</span><p className="font-bold text-[#E94335]">{user.noShowCount || 0}</p></div>
            </div>
          </div>

          {/* Pre-Scheduled Parking Connections */}
          <hr className="mb-2" />
          <div className="modern-card">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-semibold text-[#202124]">Pre-Scheduled Parking Connections</h2>
              <Badge variant="success">Anonymous</Badge>
            </div>
            <p className="text-xs text-[#757575] mb-4">
              Submit your schedule anonymously to find recurring parking matches.
            </p>
            <form onSubmit={handlePreScheduledSubmit} className="space-y-4">
              {psMessage && <p className="text-sm text-[#0F9D58] bg-[#E6F4EA] p-3 rounded-xl">{psMessage}</p>}
              {psError && <p className="text-sm text-[#E94335] bg-[#FCE8E6] p-3 rounded-xl">{psError}</p>}
              <div>
                <label className="block text-sm font-medium text-[#202124] mb-1">Role</label>
                <select value={psRole} onChange={(e) => setPsRole(e.target.value as typeof psRole)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] outline-none bg-white">
                  <option value="arriver">I need a spot</option>
                  <option value="departor">I can offer my spot</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#202124] mb-1">Schedule type</label>
                <select value={psType} onChange={(e) => setPsType(e.target.value as typeof psType)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] outline-none bg-white">
                  <option value="work">Work commute</option>
                  <option value="event">Regular event</option>
                  <option value="shift">Shift work</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#202124] mb-2">Days of week</label>
                <div className="grid grid-cols-4 gap-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label, index) => (
                    <label key={label} className="flex items-center gap-1.5 text-xs text-[#202124]">
                      <input type="checkbox" checked={psDays.includes(index)} onChange={() => toggleScheduleDay(index)} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#202124] mb-1">Arrival start</label>
                  <input type="time" value={psArrivalStart} onChange={(e) => setPsArrivalStart(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#202124] mb-1">Arrival end</label>
                  <input type="time" value={psArrivalEnd} onChange={(e) => setPsArrivalEnd(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#202124] mb-1">Departure start</label>
                  <input type="time" value={psDepartureStart} onChange={(e) => setPsDepartureStart(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#202124] mb-1">Departure end</label>
                  <input type="time" value={psDepartureEnd} onChange={(e) => setPsDepartureEnd(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#202124] mb-1">Frequency</label>
                <select value={psFrequency} onChange={(e) => setPsFrequency(e.target.value as typeof psFrequency)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] outline-none bg-white">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Biweekly</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#202124] mb-1">Start date</label>
                  <input type="date" value={psStartDate} onChange={(e) => setPsStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#202124] mb-1">End date</label>
                  <input type="date" value={psEndDate} onChange={(e) => setPsEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] outline-none" />
                </div>
              </div>
              <HoverButton type="submit" disabled={psLoading} className="w-full">
                {psLoading ? "Submitting..." : "Add Anonymous Schedule"}
              </HoverButton>
            </form>

            <div className="mt-6">
              <h3 className="font-semibold text-sm text-[#202124] mb-3">Your pre-scheduled connections</h3>
              {preScheduledConnections.length === 0 ? (
                <p className="text-xs text-[#757575]">No anonymous recurring connections yet.</p>
              ) : (
                <div className="space-y-3">
                  {preScheduledConnections.map((connection) => (
                    <HoverCard key={connection.id} className="text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant={connection.status === "confirmed" ? "success" : connection.status === "cancelled" ? "error" : "warning"}>{connection.status}</Badge>
                        <span className="text-[#4285F4] font-medium">{connection.anonymousPartner}</span>
                      </div>
                      <div className="space-y-0.5 text-[#757575]">
                        <p><span className="text-[#202124] font-medium">Neighborhood:</span> {connection.neighborhoodName}</p>
                        <p><span className="text-[#202124] font-medium">Pattern:</span> {connection.schedulePattern}</p>
                        <p><span className="text-[#202124] font-medium">Your role:</span> {connection.yourRole}</p>
                        <p><span className="text-[#202124] font-medium">Next:</span> {new Date(connection.nextOccurrence).toLocaleDateString()}</p>
                        {connection.partnerVehicleInfo && (
                          <p><span className="text-[#202124] font-medium">Partner vehicle:</span> {connection.partnerVehicleInfo.type || "any"} / {connection.partnerVehicleInfo.size || "any"}</p>
                        )}
                      </div>
                      {connection.status === "pending" && (
                        <div className="flex gap-2 mt-3">
                          <button onClick={() => handlePreScheduledAction(connection.id, "confirm")}
                            className="text-[10px] bg-[#0F9D58] text-white px-2.5 py-1 rounded-lg font-medium hover:bg-[#34A853]">Confirm</button>
                          <button onClick={() => handlePreScheduledAction(connection.id, "cancel")}
                            className="text-[10px] border border-gray-300 text-[#757575] px-2.5 py-1 rounded-lg font-medium hover:bg-gray-50">Cancel</button>
                        </div>
                      )}
                    </HoverCard>
                  ))}
                </div>
              )}
            </div>
          </div>




          <div className="text-center mt-6">
            <button onClick={() => router.push("/forgot-password")} className="text-sm text-[#4285F4] hover:underline">
              Change password
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
