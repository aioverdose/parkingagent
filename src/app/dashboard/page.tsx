"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, fetchCurrentUser } from "@/lib/auth";
import { api } from "@/lib/api";
import MapView from "@/components/MapView";
import PushNotifications from "@/components/PushNotifications";

type DashboardView = "main" | "leaving" | "need-spot" | "waiting" | "matched";

interface MatchData {
  id: string;
  status: string;
  spotLatitude: number;
  spotLongitude: number;
  matchedAt: string;
  arrivalAt: string | null;
  departingUserId?: string;
  arrivingUserId?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(getStoredUser());
  const [view, setView] = useState<DashboardView>("main");
  const [match, setMatch] = useState<MatchData | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [billingLoading, setBillingLoading] = useState(false);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState("");
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/signup");
    }
  }, [user, router]);

  useEffect(() => {
    fetchCurrentUser().then((u) => {
      if (u) setUser(u);
    });
    getCurrentPosition();
    return () => stopPolling();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  function getCurrentPosition() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoError("Geolocation not available");
      setPosition({ lat: 33.77, lng: -118.19 });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        setGeoError("Could not get location, using default");
        setPosition({ lat: 33.77, lng: -118.19 });
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function stopPolling() {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }

  async function pollForMatch(offerId: string) {
    pollingRef.current = setInterval(async () => {
      try {
        const { matches: myMatches } = await api.get<{ matches: MatchData[] }>("/api/matches/my");
        const incoming = myMatches.find(
          (m) => m.status === "active" && m.departingUserId === user?.id,
        );
        if (incoming) {
          stopPolling();
          setMatch(incoming);
          setView("matched");
          setCountdown(600);
        }
      } catch {
        // ignore polling errors
      }
    }, 5000);
  }

  if (!user) return null;

  const handleLeaving = async () => {
    if (!position) {
      setError("Waiting for your location...");
      return;
    }
    setView("leaving");
    setSearching(true);
    setError("");

    try {
      const { offer } = await api.post<{ offer: { id: string } }>("/api/pairing/offer", {
        latitude: position.lat,
        longitude: position.lng,
        address: geoError ? "Long Beach, CA (approximate)" : "My current location",
      });

      setSearching(false);
      setView("waiting");
      pollForMatch(offer.id);
    } catch {
      setError("Failed to create spot offer. Please try again.");
      setTimeout(() => setView("main"), 2000);
      setSearching(false);
    }
  };

  const handleNeedSpot = async () => {
    if (!position) {
      setError("Waiting for your location...");
      return;
    }
    setView("need-spot");
    setSearching(true);
    setError("");

    try {
      const { offers } = await api.get<{ offers: any[] }>(
        `/api/pairing/find?lat=${position.lat}&lng=${position.lng}`,
      );

      if (offers.length === 0) {
        setError("No spots available right now. Try again later.");
        setTimeout(() => setView("main"), 2000);
        setSearching(false);
        return;
      }

      const best = offers[0];
      const { match: newMatch } = await api.post<{ match: MatchData }>("/api/pairing/match", {
        offerId: best.id,
        arrivingUserId: user.id,
      });

      setMatch(newMatch);
      setView("matched");
      setCountdown(600);
    } catch {
      setError("Failed to find a spot. Please try again.");
      setTimeout(() => setView("main"), 2000);
    }
    setSearching(false);
  };

  const handleAccept = async () => {
    if (!match) return;
    try {
      await api.post("/api/pairing/accept", { matchId: match.id, action: "accept" });
      setMatch(null);
      setView("main");
    } catch {
      setError("Failed to accept match.");
    }
  };

  const handleCancel = async () => {
    if (!match) return;
    try {
      await api.post("/api/pairing/accept", { matchId: match.id, action: "cancel" });
      setMatch(null);
      setView("main");
    } catch {
      setError("Failed to cancel match.");
    }
  };

  const handleBack = () => {
    stopPolling();
    setView("main");
    setMatch(null);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between max-w-5xl mx-auto px-4 py-3">
          <div className="text-xl font-bold tracking-tight">
            <span className="text-[#4285F4]">Parking</span>{" "}
            <span className="text-[#0F9D58]">Agent</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#757575]">{user.name}</span>
            {user.membershipType && user.membershipType !== "none" && (
              <button onClick={async () => {
                setBillingLoading(true);
                try {
                  const { url } = await api.post<{ url: string }>("/api/stripe/portal");
                  window.location.href = url;
                } catch {
                  alert("Billing portal not available. Configure Stripe keys first.");
                }
                setBillingLoading(false);
              }} disabled={billingLoading}
                className="text-xs bg-gray-100 text-[#757575] px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                {billingLoading ? "Loading..." : "Manage Billing"}
              </button>
            )}
            <button
              onClick={() => {
                localStorage.removeItem("parking_agent_auth");
                router.push("/");
              }}
              className="text-sm text-[#E94335] hover:underline"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {view === "main" && (
          <div className="w-full max-w-md text-center">
            <div
              className={`rounded-2xl p-4 mb-8 ${
                user.isMember
                  ? "bg-[#E6F4EA] border border-[#0F9D58]/20"
                  : "bg-[#FCE8E6] border border-[#E94335]/30"
              }`}
            >
              <p
                className={`text-sm font-semibold ${
                  user.isMember ? "text-[#0F9D58]" : "text-[#E94335]"
                }`}
              >
                {user.isMember
                  ? "Membership Active"
                  : user.status === "pending"
                    ? "Pending — Complete Courses"
                    : "Membership Inactive"}
              </p>
              {user.membershipType && user.membershipType !== "none" && (
                <p className="text-xs text-[#757575] mt-1 capitalize">
                  {user.membershipType} plan
                </p>
              )}
            </div>

            <h1 className="text-3xl font-black text-[#202124]">
              Welcome, {user.name}
            </h1>
            <p className="text-[#757575] mt-2">What would you like to do?</p>

            {error && <p className="text-sm text-[#E94335] mt-4">{error}</p>}
            {geoError && (
              <p className="text-xs text-[#757575] mt-2">{geoError}</p>
            )}

            <div className="mt-10 space-y-4">
              <button
                onClick={handleLeaving}
                disabled={!position}
                className="w-full bg-[#4285F4] text-white px-8 py-5 rounded-2xl text-lg font-bold shadow-lg hover:bg-[#1A73E8] transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M13 12H3" />
                </svg>
                I'm Leaving
              </button>
              <button
                onClick={handleNeedSpot}
                disabled={!position}
                className="w-full border-2 border-[#0F9D58] text-[#0F9D58] px-8 py-5 rounded-2xl text-lg font-bold hover:bg-[#E6F4EA] transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                I Need a Spot
              </button>
            </div>

            <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-5 text-left">
              <h3 className="font-semibold text-sm text-[#202124] mb-2">
                Your Ranking Info
              </h3>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#757575]">Status</span>
                <span className="text-[#0F9D58] font-semibold">Good Standing</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-[#757575]">Ranking Score</span>
                <span className="text-[#202124] font-semibold">50</span>
              </div>
            </div>

            <PushNotifications />
          </div>
        )}

        {view === "leaving" && (
          <div className="w-full max-w-md text-center">
            <button
              onClick={handleBack}
              className="text-sm text-[#4285F4] hover:underline mb-6 inline-block"
            >
              &larr; Back
            </button>
            <h2 className="text-2xl font-bold text-[#202124]">You're Leaving</h2>
            <p className="text-[#757575] mt-2">
              Creating your spot offer...
            </p>
            {searching && (
              <div className="mt-10">
                <div className="w-16 h-16 border-4 border-[#E8F0FE] border-t-[#4285F4] rounded-full animate-spin mx-auto" />
                <p className="text-[#757575] mt-4">
                  Finding your location...
                </p>
              </div>
            )}
          </div>
        )}

        {view === "waiting" && (
          <div className="w-full max-w-md text-center">
            <button
              onClick={handleBack}
              className="text-sm text-[#4285F4] hover:underline mb-6 inline-block"
            >
              &larr; Cancel
            </button>
            <h2 className="text-2xl font-bold text-[#202124]">
              Spot Offered!
            </h2>
            <p className="text-[#757575] mt-2">
              Your spot is live. Waiting for a nearby member to claim it...
            </p>
            <div className="mt-10">
              <div className="w-16 h-16 border-4 border-[#E8F0FE] border-t-[#0F9D58] rounded-full animate-spin mx-auto" />
              <p className="text-[#757575] mt-6 text-sm">
                We'll notify you when a match is found.
              </p>
            </div>
          </div>
        )}

        {view === "need-spot" && (
          <div className="w-full max-w-md text-center">
            <button
              onClick={handleBack}
              className="text-sm text-[#4285F4] hover:underline mb-6 inline-block"
            >
              &larr; Back
            </button>
            <h2 className="text-2xl font-bold text-[#202124]">
              Looking for a Spot
            </h2>
            <p className="text-[#757575] mt-2">
              Finding the best spot near you based on proximity and member ranking.
            </p>
            {searching && (
              <div className="mt-10">
                <div className="w-16 h-16 border-4 border-[#E8F0FE] border-t-[#0F9D58] rounded-full animate-spin mx-auto" />
                <p className="text-[#757575] mt-4">
                  Searching for available spots nearby...
                </p>
              </div>
            )}
          </div>
        )}

        {view === "matched" && match && (
          <div className="w-full max-w-md text-center">
            <div className="animate-match-pop">
              <div className="w-20 h-20 bg-[#E6F4EA] rounded-full flex items-center justify-center mx-auto">
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0F9D58"
                  strokeWidth="2.5"
                >
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <path d="M22 4L12 14.01l-3-3" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[#202124] mt-4">
                Match Found!
              </h2>
              <p className="text-[#757575] mt-2 text-sm">
                AI has paired you with a good-standing member based on proximity and ranking.
              </p>

              <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-5 text-left space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#757575]">Spot Location</span>
                  <a
                    href={`https://maps.google.com/maps?q=${match.spotLatitude},${match.spotLongitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#4285F4] font-medium hover:underline"
                  >
                    {match.spotLatitude.toFixed(4)}, {match.spotLongitude.toFixed(4)}
                  </a>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#757575]">Status</span>
                  <span className="text-[#4285F4] font-semibold">
                    {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#757575]">Time to arrive</span>
                  <span className="text-[#202124] font-semibold">
                    {formatTime(countdown)}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <MapView
                  latitude={match.spotLatitude}
                  longitude={match.spotLongitude}
                  label="Parking spot location"
                  className="h-48"
                />
              </div>

              <div className="mt-6 space-y-3">
                <button
                  onClick={handleAccept}
                  className="w-full bg-[#0F9D58] text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-[#34A853] transition-colors"
                >
                  ✓ Accept & Arrive
                </button>
                <button
                  onClick={handleCancel}
                  className="w-full border border-gray-300 text-[#757575] px-8 py-3 rounded-2xl text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel Match
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
