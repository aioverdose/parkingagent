"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, fetchCurrentUser } from "@/lib/auth";
import { api } from "@/lib/api";
import { HoverButton } from "@/components/ui/HoverButton";
import { Badge } from "@/components/ui/Badge";
import InteractiveMap from "@/components/InteractiveMap";
import type { GeofenceCircle } from "@/components/InteractiveMap";
import { haversineDistanceMiles } from "@/lib/geo";

const POLL_INTERVAL = 3000;
const GEOFENCE_RADIUS_M = 75;

type MatchState = "matched" | "waiting_arrival" | "arrived" | "ready_to_depart" | "departing" | "complete" | "cancelled";

export default function LiveTracking({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = use(params);
  const router = useRouter();
  const [user, setUser] = useState(getStoredUser());
  const [match, setMatch] = useState<any>(null);
  const [liveLocation, setLiveLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [etaMinutes, setEtaMinutes] = useState<number | null>(null);
  const [alarmMinutes, setAlarmMinutes] = useState(5);
  const [alarmMessage, setAlarmMessage] = useState("");
  const [alarmTriggered, setAlarmTriggered] = useState(false);
  const [error, setError] = useState("");
  const [isArriving, setIsArriving] = useState(false);
  const [gpsStatus, setGpsStatus] = useState("waiting");
  const [matchState, setMatchState] = useState<MatchState>("matched");
  const [startingDeparture, setStartingDeparture] = useState(false);
  const [completing, setCompleting] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    fetchCurrentUser().then(setUser);
  }, []);

  // Load match info
  useEffect(() => {
    if (!user || !matchId) return;
    (async () => {
      try {
        const { matches } = await api.get<{ matches: any[] }>("/api/parking-match/my-matches");
        const m = matches.find((x: any) => x.matchId === matchId);
        if (m) {
          setMatch(m);
          setIsArriving(m.arrivingMemberId === user?.id);
          if (m.matchState) setMatchState(m.matchState);
        } else {
          setError("Match not found");
        }
      } catch {
        setError("Failed to load match");
      }
    })();
  }, [user, matchId]);

  // If arriving user: start GPS watcher and push location
  useEffect(() => {
    if (!isArriving || !matchId || !navigator.geolocation) return;
    if (matchState === "complete" || matchState === "cancelled") return;

    setGpsStatus("starting");
    const pushLocation = async (lat: number, lng: number, heading?: number, speed?: number) => {
      try {
        const res = await api.post<{ recorded: boolean; matchState?: string }>("/api/live/location", {
          matchId, latitude: lat, longitude: lng, heading, speed,
        });
        if (res.matchState === "arrived") {
          setMatchState("arrived");
        }
      } catch {}
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        pushLocation(latitude, longitude, pos.coords.heading ?? undefined, pos.coords.speed ?? undefined);
        setGpsStatus("active");
      },
      () => setGpsStatus("error"),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 2000 },
    );

    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [isArriving, matchId, matchState]);

  // If departing user: poll for arriving user's location and match state
  useEffect(() => {
    if (isArriving || !matchId) return;
    if (matchState === "complete" || matchState === "cancelled") return;

    const poll = async () => {
      try {
        const data = await api.get<{
          location: { latitude: number; longitude: number; timestamp: string } | null;
          match: { alarmMinutes: number; id: string; matchState: string; spotLatitude: number | null; spotLongitude: number | null };
        }>(`/api/live/location?matchId=${matchId}`);
        if (data.location) {
          setLiveLocation({ lat: data.location.latitude, lng: data.location.longitude });
          setLastUpdate(data.location.timestamp);
        }
        if (data.match.matchState) {
          setMatchState(data.match.matchState as MatchState);
        }

        // Calculate ETA from current position to spot
        const spotLat = data.match.spotLatitude ?? match?.spotLatitude;
        const spotLng = data.match.spotLongitude ?? match?.spotLongitude;
        if (data.location && spotLat && spotLng) {
          const dist = haversineDistanceMiles(data.location.latitude, data.location.longitude, spotLat, spotLng);
          const eta = Math.round(dist * 30);
          setEtaMinutes(Math.max(1, eta));

          // Check alarm
          if (data.match.alarmMinutes > 0 && eta <= data.match.alarmMinutes && !alarmTriggered) {
            setAlarmTriggered(true);
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("Arriving soon!", { body: `Member is ${eta} minutes away!` });
            }
          }
        }
      } catch {}
    };
    poll();
    const interval = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [isArriving, matchId, match, alarmTriggered, matchState]);

  const handleSetAlarm = async () => {
    try {
      const res = await api.post<{ alarmMinutes: number; message: string }>("/api/live/alarm", { matchId, alarmMinutes });
      setAlarmMessage(res.message);
    } catch {
      setAlarmMessage("Failed to set alarm");
    }
  };

  const handleStartDeparture = async () => {
    setStartingDeparture(true);
    try {
      const res = await api.post<{ matchState: string; message: string }>("/api/live/start-departure", { matchId });
      setMatchState(res.matchState as MatchState);
    } catch (e: any) {
      setError(e?.message || "Failed to start departure");
    } finally {
      setStartingDeparture(false);
    }
  };

  const handleCompleteExchange = async () => {
    setCompleting(true);
    try {
      await api.post<{ matchState: string; message: string }>("/api/live/complete-exchange", { matchId });
      setMatchState("complete");
    } catch (e: any) {
      setError(e?.message || "Failed to complete exchange");
    } finally {
      setCompleting(false);
    }
  };

  const geofence: GeofenceCircle | null =
    match && match.spotLatitude && match.spotLongitude && (matchState === "matched" || matchState === "arrived")
      ? { center: { lat: match.spotLatitude as number, lng: match.spotLongitude as number }, radiusMeters: GEOFENCE_RADIUS_M }
      : null;

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
        <div className="text-center bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-8">
          <p className="text-[#EF4444] text-lg font-bold">{error}</p>
          <button onClick={() => router.push("/profile")} className="mt-4 text-[#2563EB] underline">Back to Profile</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl shadow-sm border-b border-[#E2E8F0]">
        <div className="flex items-center justify-between max-w-5xl mx-auto px-4 sm:px-8 h-20">
          <a href="/profile" className="text-2xl font-bold tracking-tight">
            <span className="text-[#2563EB]">spotimization</span>
          </a>
          <div className="flex items-center gap-3">
            <Badge variant={isArriving ? "info" : "success"}>
              {isArriving ? "Arriving" : "Departing"}
            </Badge>
            <button onClick={() => router.push("/profile")} className="text-sm text-[#2563EB] hover:underline">Profile</button>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-8 py-10">
        <div className="modern-hero px-6 py-10 sm:px-10 text-center mb-8">
          <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-white">Live Tracking</h1>
          {match && (
            <p className="text-lg text-white/90 mt-3">
              {isArriving
                ? matchState === "complete"
                  ? "Exchange complete!"
                  : "Sharing your location with the departing member"
                : `Tracking ${match.anonymousPartner}`}
            </p>
          )}
          <div className="mt-2">
            <StateBadge matchState={matchState} />
          </div>
          </div>
        </div>

        {/* GPS Status (arriving user only) */}
        {isArriving && matchState !== "complete" && (
          <div className="mb-4 text-center">
            <span className={`inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full ${
              gpsStatus === "active" ? "bg-[#D1FAE5] text-[#059669]" :
              gpsStatus === "starting" ? "bg-[#DBEAFE] text-[#2563EB]" :
              "bg-[#FEE2E2] text-[#DC2626]"
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                gpsStatus === "active" ? "bg-[#059669] animate-pulse" :
                gpsStatus === "starting" ? "bg-[#2563EB]" : "bg-[#DC2626]"
              }`} />
              {gpsStatus === "active" ? "Sharing live location" :
               gpsStatus === "starting" ? "Starting GPS..." : "GPS error"}
            </span>
          </div>
        )}

        {/* Map */}
        <div className="rounded-xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.12)] mb-6">
          <InteractiveMap
            center={{ lat: 33.7701, lng: -118.1937 }}
            onPinDrop={() => {}}
            pinPosition={null}
            spotPosition={
              match && match.spotLatitude && match.spotLongitude
                ? { lat: match.spotLatitude as number, lng: match.spotLongitude as number }
                : null
            }
            livePosition={liveLocation}
            geofence={geofence}
            className="w-full h-80"
          />
        </div>

        {/* State-specific UI */}
        {matchState === "matched" && !isArriving && (
          <>
            {etaMinutes !== null ? (
          <div className={`rounded-xl p-6 text-center mb-6 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.08)] ${
                alarmTriggered ? "border-[#EF4444] bg-[#FEE2E2] animate-pulse" : "border-[#2563EB] bg-[#DBEAFE]"
              }`}>
                <p className="text-xs text-[#64748B] uppercase tracking-wider mb-1">
                  {alarmTriggered ? "ALARM - ARRIVING NOW!" : "Estimated arrival"}
                </p>
                <p className={`text-4xl font-black ${alarmTriggered ? "text-[#EF4444]" : "text-[#2563EB]"}`}>
                  {etaMinutes} min
                </p>
                <p className="text-xs text-[#64748B] mt-2">
                  Last updated: {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : "waiting..."}
                </p>
              </div>
            ) : (
              <div className="rounded-xl bg-white p-6 text-center mb-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
                <div className="w-6 h-6 border-2 border-[#DBEAFE] border-t-[#2563EB] rounded-full animate-spin mx-auto" />
                <p className="text-xs text-[#64748B] mt-3">Waiting for the arriving member to share location...</p>
              </div>
            )}

            {/* Alarm Setting (departing user, matched state) */}
            <AlarmSection
              alarmMinutes={alarmMinutes}
              setAlarmMinutes={setAlarmMinutes}
              alarmMessage={alarmMessage}
              handleSetAlarm={handleSetAlarm}
              alarmTriggered={alarmTriggered}
            />
          </>
        )}

        {matchState === "matched" && isArriving && (
          <div className="rounded-xl bg-[#DBEAFE] p-6 text-center mb-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <div className="w-4 h-4 bg-[#2563EB] rounded-full animate-pulse mx-auto mb-2" />
            <p className="font-bold text-[#2563EB]">Your location is being shared</p>
            <p className="text-xs text-[#64748B] mt-1">The departing member can see your approach in real-time</p>
            <p className="text-xs text-[#64748B] mt-2">You'll automatically be detected when you reach the geofence area around the spot.</p>
          </div>
        )}

        {matchState === "arrived" && !isArriving && (
          <div className="rounded-xl bg-[#D1FAE5] p-6 text-center mb-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <div className="w-10 h-10 bg-[#10B981] rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-bold text-[#10B981] text-lg">Arriving user is positioned!</p>
            <p className="text-sm text-[#64748B] mt-1">They are within the spot geofence. You can now safely start your departure.</p>
            <button
              onClick={handleStartDeparture}
              disabled={startingDeparture}
              className="mt-4 w-full bg-[#10B981] hover:bg-[#059669] disabled:bg-[#CBD5E1] text-white font-semibold py-3.5 px-6 rounded-lg transition-all shadow-[0_4px_12px_rgba(16,185,129,0.3)]"
            >
              {startingDeparture ? "Starting..." : "START DEPARTURE"}
            </button>
          </div>
        )}

        {matchState === "arrived" && isArriving && (
          <div className="rounded-xl bg-[#D1FAE5] p-6 text-center mb-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <div className="w-10 h-10 bg-[#10B981] rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-bold text-[#10B981] text-lg">You've arrived at the spot!</p>
            <p className="text-sm text-[#64748B] mt-1">Waiting for the departing user to start their car and leave the spot.</p>
          </div>
        )}

        {matchState === "departing" && !isArriving && (
          <div className="rounded-xl bg-[#FEF3C7] p-6 text-center mb-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <div className="w-10 h-10 bg-[#F59E0B] rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="font-bold text-[#F59E0B] text-lg">You're departing!</p>
            <p className="text-sm text-[#64748B] mt-1">Please leave the spot so the arriving user can park.</p>
            <button
              onClick={handleCompleteExchange}
              disabled={completing}
              className="mt-4 w-full bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-[#CBD5E1] text-white font-semibold py-3.5 px-6 rounded-lg transition-all shadow-[0_4px_12px_rgba(37,99,235,0.3)]"
            >
              {completing ? "Completing..." : "I've left the spot"}
            </button>
          </div>
        )}

        {matchState === "departing" && isArriving && (
          <div className="rounded-xl bg-[#FEF3C7] p-6 text-center mb-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <div className="w-10 h-10 bg-[#F59E0B] rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="font-bold text-[#F59E0B] text-lg">Departing user is leaving!</p>
            <p className="text-sm text-[#64748B] mt-1">They are vacating the spot. You can park once they've left.</p>
            <button
              onClick={handleCompleteExchange}
              disabled={completing}
              className="mt-4 w-full bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-[#CBD5E1] text-white font-semibold py-3.5 px-6 rounded-lg transition-all shadow-[0_4px_12px_rgba(37,99,235,0.3)]"
            >
              {completing ? "Completing..." : "I've parked"}
            </button>
          </div>
        )}

        {matchState === "complete" && (
          <div className="rounded-xl bg-[#D1FAE5] p-6 text-center mb-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <div className="w-12 h-12 bg-[#10B981] rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-bold text-[#10B981] text-xl">Exchange Complete!</p>
            <p className="text-sm text-[#64748B] mt-1">
              {isArriving ? "The spot is yours. Enjoy parking!" : "The arriving user now has the spot."}
            </p>
            <HoverButton onClick={() => router.push("/profile")} className="mt-4 w-full">
              Back to Profile
            </HoverButton>
          </div>
        )}

        {/* Match Details Summary */}
        {match && (
          <div className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-5 text-xs text-[#64748B]">
            <p><strong className="text-[#1E293B]">Match:</strong> {match.anonymousPartner}</p>
            {match.arrivalLookingTime && (
              <p><strong className="text-[#1E293B]">Arrival:</strong> {formatTime(match.arrivalLookingTime)}</p>
            )}
            {match.leavingTime && (
              <p><strong className="text-[#1E293B]">Departure:</strong> {formatTime(match.leavingTime)}</p>
            )}
            <p><strong className="text-[#1E293B]">Status:</strong> {matchState}</p>
          </div>
        )}
      </main>
    </div>
  );
}

function StateBadge({ matchState }: { matchState: MatchState }) {
  const styles: Record<string, string> = {
    matched: "bg-[#DBEAFE] text-[#2563EB]",
    arrived: "bg-[#D1FAE5] text-[#059669]",
    departing: "bg-[#FEF3C7] text-[#D97706]",
    complete: "bg-[#D1FAE5] text-[#059669]",
    cancelled: "bg-[#FEE2E2] text-[#DC2626]",
  };
  const labels: Record<string, string> = {
    matched: "Tracking",
    arrived: "Positioned",
    departing: "Departing",
    complete: "Complete",
    cancelled: "Cancelled",
  };
  return (
    <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${styles[matchState] || "bg-[#F1F5F9] text-[#64748B]"}`}>
      {labels[matchState] || matchState}
    </span>
  );
}

function AlarmSection({
  alarmMinutes, setAlarmMinutes, alarmMessage, handleSetAlarm, alarmTriggered,
}: {
  alarmMinutes: number;
  setAlarmMinutes: (n: number) => void;
  alarmMessage: string;
  handleSetAlarm: () => void;
  alarmTriggered: boolean;
}) {
  return (
    <div className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-6 mb-6">
      <h2 className="font-bold text-[#1E293B] text-sm mb-1">Set Arrival Alarm</h2>
      <p className="text-xs text-[#64748B] mb-4">
        Get notified when the arriving member is within a certain distance, so you have time to get to your vehicle.
      </p>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={1}
          max={15}
          value={alarmMinutes}
          onChange={(e) => setAlarmMinutes(Number(e.target.value))}
          className="flex-1 accent-[#2563EB]"
        />
        <span className="text-sm font-bold text-[#1E293B] w-12 text-right">{alarmMinutes} min</span>
      </div>
      <p className="text-xs text-[#64748B] mt-2">
        We'll notify you when the arriving member is ~{alarmMinutes} minutes away, giving you time to head to your car.
      </p>
      <div className="flex gap-2 mt-4">
        <HoverButton onClick={handleSetAlarm} className="flex-1">
          {alarmMessage ? "Updated!" : "Set Alarm"}
        </HoverButton>
      </div>
      {alarmMessage && (
        <p className="text-xs text-[#10B981] mt-2 text-center">{alarmMessage}</p>
      )}
      {alarmTriggered && (
        <div className="mt-4 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl p-4 text-center">
          <p className="text-lg font-black text-[#EF4444]">{"\uD83D\uDD14"} ARRIVING NOW!</p>
          <p className="text-sm text-[#64748B] mt-1">Time to head to your vehicle!</p>
        </div>
      )}
    </div>
  );
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}
