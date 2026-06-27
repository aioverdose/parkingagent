"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, fetchCurrentUser } from "@/lib/auth";
import { api } from "@/lib/api";
import { HoverButton } from "@/components/ui/HoverButton";
import { HoverCard } from "@/components/ui/HoverCard";
import { Badge } from "@/components/ui/Badge";
import { neighborhoods } from "@/lib/neighborhoods";

interface ScoutProfile {
  id: string;
  name: string;
  anchorCount: number;
  successfulMatches: number;
  failedMatches: number;
  scoutLevel: number;
  scoutLevelTitle: string;
  scoutPoints: number;
  scoutBadges: string[];
  ranking: number;
  tier: string;
  isPremium: boolean;
}

interface Anchor {
  id: string;
  latitude: number;
  longitude: number;
  neighborhood: string;
  status: string;
  minerId: string | null;
  createdAt: string;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  scoutLevel: number;
  scoutLevelTitle: string;
  scoutPoints: number;
  ranking: number;
  successfulMatches: number;
  scoutId: string;
}

export default function ScoutPage() {
  const router = useRouter();
  const [user, setUser] = useState(getStoredUser());
  const [profile, setProfile] = useState<ScoutProfile | null>(null);
  const [anchors, setAnchors] = useState<Anchor[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [anchorLoading, setAnchorLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState("");
  const [tab, setTab] = useState<"scout" | "leaderboard">("scout");

  const isPremium = user?.tier === "premium" || user?.isPremium === true;

  useEffect(() => {
    if (!user) { router.push("/signup"); return; }
    Promise.all([fetchProfile(), fetchLeaderboard()]).finally(() => setLoading(false));
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => { setGeoError("Using default location"); setPosition({ lat: neighborhoods.defaultLat, lng: neighborhoods.defaultLng }); },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    } else { setGeoError("Geolocation not available"); setPosition({ lat: neighborhoods.defaultLat, lng: neighborhoods.defaultLng }); }
  }, []);

  async function fetchProfile() {
    try {
      const { profile, anchors: a } = await api.get<{ profile: ScoutProfile; anchors: Anchor[] }>("/api/scout/profile");
      setProfile(profile);
      setAnchors(a);
      if (user) {
        const updatedUser = { ...user, ...profile };
        localStorage.setItem("spotimization_auth", JSON.stringify(updatedUser));
      }
    } catch { console.error("Failed to fetch scout profile"); }
  }

  async function fetchLeaderboard() {
    try {
      const { leaderboard } = await api.get<{ leaderboard: LeaderboardEntry[] }>("/api/scout/leaderboard");
      setLeaderboard(leaderboard);
    } catch { console.error("Failed to fetch leaderboard"); }
  }

  async function handleAnchor() {
    if (!position) { setError("Waiting for GPS location..."); return; }
    setAnchorLoading(true); setMessage(""); setError("");
    try {
      const { message } = await api.post<{ message: string }>("/api/scout/anchor", {
        lat: position.lat,
        lng: position.lng,
      });
      setMessage(message);
      fetchProfile();
      fetchLeaderboard();
    } catch (err: any) {
      setError(err.message || "Failed to anchor spot.");
    }
    setAnchorLoading(false);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-sm text-[#757575]">Loading...</div>;

  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
            <a href="/dashboard" className="text-lg font-bold tracking-tight">spotimization</a>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-[#757575] hidden sm:inline">{user?.name}</span>
            {isPremium && <Badge variant="success">Premium</Badge>}
            <a href="/profile" className="text-[#4285F4] hover:underline">Profile</a>
            <button onClick={() => router.push("/dashboard")} className="text-[#757575] hover:underline">Dashboard</button>
          </div>
        </div>
      </nav>

      <main className="max-w-lg mx-auto px-4 py-8">
        {/* Tab Toggle */}
        <div className="flex gap-2 mb-6 bg-gray-100 rounded-xl p-1">
          <button onClick={() => setTab("scout")}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${tab === "scout" ? "bg-white shadow-sm text-[#202124]" : "text-[#757575]"}`}>
            🕵️ Scout Mode
          </button>
          <button onClick={() => setTab("leaderboard")}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${tab === "leaderboard" ? "bg-white shadow-sm text-[#202124]" : "text-[#757575]"}`}>
            🏆 Leaderboard
          </button>
        </div>

        {tab === "scout" && (
          <div className="space-y-6">
            {/* Profile Banner */}
            {profile && (
              <HoverCard className="text-center">
                <div className="text-3xl mb-2">🕵️</div>
                <h1 className="text-xl font-bold text-[#202124]">{profile.name}</h1>
                <p className="text-sm text-[#4285F4] font-semibold">{profile.scoutLevelTitle}</p>
                <div className="flex items-center justify-center gap-4 mt-2 text-xs">
                  <span className="text-[#F9A825] font-bold">{profile.ranking}⭐</span>
                  <span className="text-[#202124] font-bold">{profile.scoutPoints} pts</span>
                  <span className="text-[#0F9D58] font-bold">Lv.{profile.scoutLevel}</span>
                </div>
              </HoverCard>
            )}

            {/* Badges */}
            {profile && profile.scoutBadges.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-[#202124] mb-2">🏅 Badges</h3>
                <div className="flex flex-wrap gap-1.5">
                  {profile.scoutBadges.map((badge) => (
                    <span key={badge} className="text-[10px] bg-[#FFF3E0] text-[#F9A825] font-semibold px-2.5 py-1 rounded-full">
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            {profile && (
              <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                <div className="bg-gray-50 rounded-lg p-2.5"><span className="text-[#757575]">Anchored</span><p className="font-bold text-[#202124]">{profile.anchorCount}</p></div>
                <div className="bg-gray-50 rounded-lg p-2.5"><span className="text-[#757575]">Successful</span><p className="font-bold text-[#0F9D58]">{profile.successfulMatches}</p></div>
                <div className="bg-gray-50 rounded-lg p-2.5"><span className="text-[#757575]">Failed</span><p className="font-bold text-[#E94335]">{profile.failedMatches}</p></div>
              </div>
            )}

            {geoError && <p className="text-[10px] text-[#757575] text-center">{geoError}</p>}
            {message && <p className="text-sm text-[#0F9D58] bg-[#E6F4EA] p-3 rounded-xl">{message}</p>}
            {error && <p className="text-sm text-[#E94335] bg-[#FCE8E6] p-3 rounded-xl">{error}</p>}

            {/* Premium info */}
            {!isPremium && (
              <div className="bg-[#FFF3E0] border border-[#FBBB05]/30 rounded-xl p-4 text-center text-xs">
                <p className="font-semibold text-[#202124]">Premium Scouts get:</p>
                <p className="text-[#757575] mt-1">10 anchors/day (vs 5), priority matching, +10% points, exclusive badge</p>
                <button onClick={() => router.push("/premium")}
                  className="mt-2 bg-[#F9A825] text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-[#F59E0B] transition-colors">
                  Upgrade to Premium
                </button>
              </div>
            )}

            {/* Anchor Button */}
            <div className="text-center">
              <button onClick={handleAnchor} disabled={anchorLoading || !position}
                className="w-full bg-gradient-to-r from-[#F9A825] to-[#FBBB05] text-white px-8 py-6 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100">
                {anchorLoading ? "Anchoring..." : "📍 Anchor Spot"}
              </button>
              <p className="text-[10px] text-[#757575] mt-2">
                Tap when you see an open parking spot while traveling.
              </p>
              <p className="text-[10px] text-[#757575]">
                Daily limit: {isPremium ? "10" : "5"} anchors • 5 min cooldown
              </p>
            </div>

            {/* Recent Anchors */}
            {anchors.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-[#202124]">Recent Anchors</h3>
                {anchors.slice().reverse().slice(0, 20).map((a) => {
                  const statusVariant = a.status === "completed" ? "success" : a.status === "claimed" ? "warning" : a.status === "failed" ? "error" : "info";
                  return (
                    <HoverCard key={a.id} className="text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant={statusVariant}>{a.status}</Badge>
                        <span className="text-[10px] text-[#757575]">{new Date(a.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="space-y-0.5 text-[#757575]">
                        <p><span className="text-[#202124] font-medium">Neighborhood:</span> {a.neighborhood}</p>
                        <p><span className="text-[#202124] font-medium">Location:</span> {a.latitude.toFixed(4)}, {a.longitude.toFixed(4)}</p>
                        {a.minerId && <p><span className="text-[#0F9D58] font-medium">Claimed by:</span> Member #{a.minerId.slice(0, 4).toUpperCase()}</p>}
                      </div>
                    </HoverCard>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === "leaderboard" && (
          <div>
            <h2 className="text-lg font-bold text-[#202124] mb-1">🏆 Top Scouts</h2>
            <p className="text-xs text-[#757575] mb-4">Ranked by scout points</p>
            <div className="space-y-1.5">
              {leaderboard.map((entry, index) => (
                <div key={entry.id}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs ${
                    index === 0 ? "bg-[#FFF3E0] border border-[#FBBB05]/30" :
                    index < 3 ? "bg-gray-50" : ""
                  }`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 flex items-center justify-center rounded-full font-bold text-xs ${
                      index === 0 ? "bg-[#F9A825] text-white" :
                      index === 1 ? "bg-gray-300 text-white" :
                      index === 2 ? "bg-amber-600 text-white" :
                      "text-[#757575]"
                    }`}>{index + 1}</span>
                    <div>
                      <p className="font-semibold text-[#202124]">{entry.name}</p>
                      <p className="text-[10px] text-[#757575]">{entry.scoutId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#202124]">{entry.scoutPoints} pts</p>
                    <p className="text-[10px] text-[#4285F4]">{entry.scoutLevelTitle}</p>
                  </div>
                </div>
              ))}
              {leaderboard.length === 0 && (
                <p className="text-sm text-[#757575] text-center py-8">No scouts yet. Be the first!</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
