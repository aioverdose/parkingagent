"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, fetchCurrentUser } from "@/lib/auth";
import { api } from "@/lib/api";
import { HoverButton } from "@/components/ui/HoverButton";
import { HoverCard } from "@/components/ui/HoverCard";
import { Badge } from "@/components/ui/Badge";

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
}

interface BeaconRequest {
  id: string;
  departureTime: string;
  radius: number;
  status: string;
  matchedMemberId: string | null;
  createdAt: string;
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
  const [vehicleType, setVehicleType] = useState("");
  const [vehicleSize, setVehicleSize] = useState("");
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Tier 1: Preliminary Matching
  const [leavingTime, setLeavingTime] = useState("");
  const [arrivalLookingTime, setArrivalLookingTime] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [t1Message, setT1Message] = useState("");
  const [t1Error, setT1Error] = useState("");
  const [t1Loading, setT1Loading] = useState(false);
  const [parkingMatches, setParkingMatches] = useState<ParkingMatch[]>([]);
  const [showMatches, setShowMatches] = useState(true);

  // Tier 3: Departure Beacon
  const [beaconDepartureTime, setBeaconDepartureTime] = useState("");
  const [beaconMessage, setBeaconMessage] = useState("");
  const [beaconError, setBeaconError] = useState("");
  const [beaconLoading, setBeaconLoading] = useState(false);
  const [beacons, setBeacons] = useState<BeaconRequest[]>([]);
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);

  const isPremium = user?.tier === "premium" || user?.isPremium === true;

  useEffect(() => {
    if (!user) { router.push("/signup"); return; }
    fetchCurrentUser().then((u) => {
      if (u) {
        setUser(u); setName(u.name); setEmail(u.email);
        setVehicleType(u.vehicleType || "");
        setVehicleSize(u.vehicleSize || "");
        setVehicleMake(u.vehicleMake || "");
        setVehicleModel(u.vehicleModel || "");
        setLicensePlate(u.licensePlate || "");
        setNeighborhood(u.neighborhood || "");
      }
    });
    fetchParkingMatches();
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setPosition({ lat: 33.77, lng: -118.19 }),
        { enableHighAccuracy: true, timeout: 10000 },
      );
    } else {
      setPosition({ lat: 33.77, lng: -118.19 });
    }
  }, []);

  async function fetchParkingMatches() {
    try {
      const { matches } = await api.get<{ matches: ParkingMatch[] }>("/api/parking-match/my-matches");
      setParkingMatches(matches);
    } catch { console.error("Failed to fetch parking matches"); }
  }

  async function fetchBeacons() {
    try {
      const { beacons } = await api.get<{ beacons: BeaconRequest[] }>("/api/beacon/my-beacons");
      setBeacons(beacons);
    } catch { console.error("Failed to fetch beacons"); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(""); setError(""); setLoading(true);
    try {
      const { user: updated } = await api.put<{ user: any }>("/api/auth/profile", {
        name, email,
        vehicleType: vehicleType || undefined,
        vehicleSize: vehicleSize || undefined,
        vehicleMake: vehicleMake || undefined,
        vehicleModel: vehicleModel || undefined,
        licensePlate: licensePlate || undefined,
        neighborhood: neighborhood || undefined,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });
      if (updated) {
        localStorage.setItem("parking_agent_auth", JSON.stringify(updated));
        setUser(updated);
        setMessage("Profile updated successfully");
        setCurrentPassword(""); setNewPassword("");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    }
    setLoading(false);
  }

  async function handleT1Submit(e: React.FormEvent) {
    e.preventDefault();
    setT1Message(""); setT1Error("");
    if (!leavingTime || !arrivalLookingTime) {
      setT1Error("Both arrival time and departure time are required.");
      return;
    }
    setT1Loading(true);
    try {
      const { message } = await api.post<{ message: string }>("/api/parking-match-schedule", {
        leavingTime,
        arrivalLookingTime,
        neighborhood: neighborhood || undefined,
      });
      setT1Message(message);
      setLeavingTime(""); setArrivalLookingTime("");
      fetchParkingMatches();
    } catch (err: any) {
      setT1Error(err.message || "Failed to submit schedule.");
    }
    setT1Loading(false);
  }

  async function handleConfirmMatch(matchId: string) {
    try {
      await api.post("/api/parking-match/confirm", { matchId });
      fetchParkingMatches();
    } catch {
      setT1Error("Failed to confirm match.");
    }
  }

  async function handleCancelMatch(matchId: string) {
    try {
      await api.post("/api/parking-match/cancel", { matchId });
      await api.post("/api/ranking/update", { action: "cancel" });
      fetchParkingMatches();
    } catch {
      setT1Error("Failed to cancel match.");
    }
  }

  async function handleBeaconSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBeaconMessage(""); setBeaconError("");
    if (!isPremium) {
      setBeaconError("Departure Beacon is a Premium feature. Upgrade to use it.");
      return;
    }
    if (!beaconDepartureTime || !position) {
      setBeaconError("Departure time and location are required.");
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
      console.error("Beacon error:", err);
      setBeaconError(err.message || "Failed to send beacon.");
    }
    setBeaconLoading(false);
  }

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between max-w-5xl mx-auto px-4 py-3">
          <a href="/dashboard" className="text-xl font-bold tracking-tight">
            <span className="text-[#4285F4]">Parking</span>{" "}
            <span className="text-[#0F9D58]">Agent</span>
          </a>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#757575]">{user.name}</span>
            {isPremium && <Badge variant="success">Premium</Badge>}
            <button onClick={() => router.push("/dashboard")}
              className="text-sm text-[#4285F4] hover:underline">Dashboard</button>
          </div>
        </div>
      </nav>

      <main className="flex-1 px-4 py-12">
        <div className="w-full max-w-lg mx-auto space-y-10">
          
          {/* Profile Settings */}
          <div>
            <h1 className="text-2xl font-bold text-[#202124] text-center">Profile Settings</h1>
            <p className="text-[#757575] text-center mt-1 text-sm">Update your information</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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

              <hr className="my-4" />
              <h2 className="text-lg font-semibold text-[#202124]">Vehicle Info</h2>
              <p className="text-xs text-[#757575] -mt-3 mb-4">Used for spot compatibility matching</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="vehicleType" className="block text-sm font-medium text-[#202124] mb-1">Type</label>
                  <select id="vehicleType" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] outline-none bg-white">
                    <option value="">Any</option>
                    <option value="car">Car</option>
                    <option value="motorcycle">Motorcycle</option>
                    <option value="bike">Bike</option>
                    <option value="truck">Truck</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="vehicleSize" className="block text-sm font-medium text-[#202124] mb-1">Size</label>
                  <select id="vehicleSize" value={vehicleSize} onChange={(e) => setVehicleSize(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] outline-none bg-white">
                    <option value="">Any</option>
                    <option value="compact">Compact</option>
                    <option value="standard">Standard</option>
                    <option value="large">Large</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="vehicleMake" className="block text-sm font-medium text-[#202124] mb-1">Make</label>
                  <input id="vehicleMake" type="text" value={vehicleMake} onChange={(e) => setVehicleMake(e.target.value)} placeholder="e.g. Toyota"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] outline-none" />
                </div>
                <div>
                  <label htmlFor="vehicleModel" className="block text-sm font-medium text-[#202124] mb-1">Model</label>
                  <input id="vehicleModel" type="text" value={vehicleModel} onChange={(e) => setVehicleModel(e.target.value)} placeholder="e.g. Camry"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] outline-none" />
                </div>
              </div>
              <div>
                <label htmlFor="licensePlate" className="block text-sm font-medium text-[#202124] mb-1">License Plate</label>
                <input id="licensePlate" type="text" value={licensePlate} onChange={(e) => setLicensePlate(e.target.value)} placeholder="ABC1234"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] outline-none" />
              </div>
              <div>
                <label htmlFor="neighborhood" className="block text-sm font-medium text-[#202124] mb-1">Neighborhood</label>
                <input id="neighborhood" type="text" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="e.g. Downtown, Midtown"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] outline-none" />
              </div>
              <hr className="my-4" />
              <h2 className="text-lg font-semibold text-[#202124]">Change Password</h2>
              <p className="text-xs text-[#757575] -mt-3 mb-4">Leave blank to keep current password</p>
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-[#202124] mb-1">Current Password</label>
                <input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] outline-none" />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-[#202124] mb-1">New Password</label>
                <input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] outline-none" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-[#4285F4] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#1A73E8] transition-colors disabled:opacity-50">
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>

          {/* Ranking Display */}
          <hr className="mb-2" />
          <div>
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

          {/* Tier 1: Preliminary Matching (Free) */}
          <hr className="mb-2" />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-semibold text-[#202124]">Preliminary Matching (Free)</h2>
              <Badge variant="success">Free</Badge>
            </div>
            <p className="text-xs text-[#757575] mb-4">
              Enter your arrival and departure times to get matched based on time and proximity.
            </p>

            <form onSubmit={handleT1Submit} className="space-y-4">
              {t1Message && <p className="text-sm text-[#0F9D58] bg-[#E6F4EA] p-3 rounded-xl">{t1Message}</p>}
              {t1Error && <p className="text-sm text-[#E94335] bg-[#FCE8E6] p-3 rounded-xl">{t1Error}</p>}

              <div>
                <label htmlFor="arrivalLookingTime" className="block text-sm font-medium text-[#202124] mb-1">Time you arrive and are looking for a spot</label>
                <input id="arrivalLookingTime" type="time" value={arrivalLookingTime} onChange={(e) => setArrivalLookingTime(e.target.value)}
                  placeholder="e.g., 08:00"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] outline-none" />
              </div>
              <div>
                <label htmlFor="leavingTime" className="block text-sm font-medium text-[#202124] mb-1">Time you depart your parking spot</label>
                <input id="leavingTime" type="time" value={leavingTime} onChange={(e) => setLeavingTime(e.target.value)}
                  placeholder="e.g., 17:30"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] outline-none" />
              </div>
              <div>
                <label htmlFor="t1Neighborhood" className="block text-sm font-medium text-[#202124] mb-1">Neighborhood</label>
                <input id="t1Neighborhood" type="text" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)}
                  placeholder="e.g. Downtown, Midtown"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] outline-none" />
              </div>
              <HoverButton type="submit" disabled={t1Loading} className="w-full">
                {t1Loading ? "Submitting..." : "Submit for Matching"}
              </HoverButton>
            </form>

            {/* Parking Matches List */}
            {parkingMatches.length > 0 && (
              <div className="mt-6">
                <button onClick={() => setShowMatches(!showMatches)}
                  className="text-sm font-semibold text-[#202124] flex items-center gap-2 mb-3">
                  <span>Your matches ({parkingMatches.length})</span>
                  <svg className={`w-4 h-4 transition-transform ${showMatches ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                </button>
                {showMatches && (
                  <div className="space-y-2">
                    {parkingMatches.map((m) => {
                      const isLeaver = m.leavingMemberId === user?.id;
                      const statusVariant = m.status === "confirmed" ? "success" : m.status === "cancelled" ? "error" : "warning";
                      return (
                        <HoverCard key={m.matchId} className="text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <Badge variant={statusVariant}>{m.status}</Badge>
                            <RankingStars ranking={isLeaver ? m.ownRanking || 5 : m.partnerRanking || 5} />
                          </div>
                          <div className="space-y-0.5 text-[#757575]">
                            <p><span className="text-[#202124] font-medium">Matched member:</span> {m.anonymousPartner}</p>
                            <p><span className="text-[#202124] font-medium">{isLeaver ? "You leave" : "Partner leaves"}:</span> {formatTime(m.leavingTime)}</p>
                            <p><span className="text-[#202124] font-medium">{isLeaver ? "Partner arrives" : "You arrive"}:</span> {formatTime(m.arrivalLookingTime)}</p>
                            {m.partnerVehicleInfo && (m.partnerVehicleInfo.type || m.partnerVehicleInfo.size) && (
                              <p><span className="text-[#202124] font-medium">Vehicle:</span> {m.partnerVehicleInfo.type || "any"} / {m.partnerVehicleInfo.size || "any"}</p>
                            )}
                            <p><span className="text-[#4285F4]">{m.anonymousPartner}</span></p>
                            {m.status === "pending" && (
                              <div className="flex gap-2 mt-1.5">
                                <button onClick={() => handleConfirmMatch(m.matchId)}
                                  className="text-[10px] bg-[#0F9D58] text-white px-2.5 py-1 rounded-lg font-medium hover:bg-[#34A853]">Confirm</button>
                                <button onClick={() => handleCancelMatch(m.matchId)}
                                  className="text-[10px] border border-gray-300 text-[#757575] px-2.5 py-1 rounded-lg font-medium hover:bg-gray-50">Cancel</button>
                              </div>
                            )}
                          </div>
                        </HoverCard>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tier 3: Departure Beacon (Premium) */}
          <hr className="mb-2" />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-semibold text-[#202124]">Departure Beacon (Premium)</h2>
              {isPremium ? <Badge variant="success">Premium</Badge> : <Badge variant="warning">Premium</Badge>}
            </div>
            <p className="text-xs text-[#757575] mb-4">
              Send a beacon to the system when you are departing. We will look for incoming members in your area.
            </p>

            {!isPremium && (
              <div className="bg-[#FFF3E0] border border-[#FBBB05]/30 rounded-xl p-4 mb-4 text-center">
                <p className="text-sm text-[#202124] font-semibold">Premium Feature</p>
                <p className="text-xs text-[#757575] mt-1">Upgrade to Premium to use the Departure Beacon.</p>
                <button onClick={() => router.push("/premium")}
                  className="mt-3 bg-[#F9A825] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#F59E0B] transition-colors">
                  Upgrade to Premium ($4.99/month)
                </button>
              </div>
            )}

            <form onSubmit={handleBeaconSubmit} className="space-y-4">
              {beaconMessage && <p className="text-sm text-[#0F9D58] bg-[#E6F4EA] p-3 rounded-xl">{beaconMessage}</p>}
              {beaconError && <p className="text-sm text-[#E94335] bg-[#FCE8E6] p-3 rounded-xl">{beaconError}</p>}

              <div>
                <label htmlFor="beaconDepartureTime" className="block text-sm font-medium text-[#202124] mb-1">Departure time</label>
                <input id="beaconDepartureTime" type="time" value={beaconDepartureTime} onChange={(e) => setBeaconDepartureTime(e.target.value)}
                  disabled={!isPremium}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] outline-none disabled:opacity-50" />
              </div>
              <HoverButton type="submit" disabled={beaconLoading || !isPremium} className="w-full">
                {beaconLoading ? "Sending..." : "Send Beacon"}
              </HoverButton>
            </form>

            {/* Beacon Requests List */}
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
                        <p><span className="text-[#202124] font-medium">Departure time:</span> {b.departureTime}</p>
                        <p><span className="text-[#202124] font-medium">Created:</span> {new Date(b.createdAt).toLocaleDateString()}</p>
                        {b.matchedMemberId && <p><span className="text-[#0F9D58] font-medium">Matched with:</span> Member #{b.matchedMemberId.slice(0, 4).toUpperCase()}</p>}
                      </div>
                    </HoverCard>
                  );
                })}
              </div>
            )}
          </div>

          {/* Scout Profile Section */}
          <hr className="mb-2" />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-semibold text-[#202124]">🕵️ Spot Scout</h2>
              <Badge variant="success">Free</Badge>
            </div>
            <p className="text-xs text-[#757575] mb-3">
              Anchor open spots you see while traveling and earn points, levels, and badges.
            </p>

            <div className="flex items-center justify-between mb-3 text-xs">
              <div className="text-center flex-1 bg-gray-50 rounded-lg p-2 mx-1">
                <p className="text-[#757575] text-[10px]">Level</p>
                <p className="font-bold text-[#202124]">{user.scoutLevel || 1}</p>
                <p className="text-[10px] text-[#4285F4]">{["Rookie","Beginner","Junior","Experienced","Master","Legend","Top"][(user.scoutLevel || 1) - 1] || "Rookie"} Scout</p>
              </div>
              <div className="text-center flex-1 bg-gray-50 rounded-lg p-2 mx-1">
                <p className="text-[#757575] text-[10px]">Points</p>
                <p className="font-bold text-[#202124]">{user.scoutPoints || 0}</p>
              </div>
              <div className="text-center flex-1 bg-gray-50 rounded-lg p-2 mx-1">
                <p className="text-[#757575] text-[10px]">Badges</p>
                <p className="font-bold text-[#202124]">
                  {user.scoutBadges ? JSON.parse(user.scoutBadges).length : 0}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[10px] mb-4">
              <div className="bg-gray-50 rounded-lg p-2"><span className="text-[#757575]">Anchored</span><p className="font-bold text-[#202124]">{user.anchorCount || 0}</p></div>
              <div className="bg-gray-50 rounded-lg p-2"><span className="text-[#757575]">Successful</span><p className="font-bold text-[#0F9D58]">{user.successfulMatches || 0}</p></div>
              <div className="bg-gray-50 rounded-lg p-2"><span className="text-[#757575]">Failed</span><p className="font-bold text-[#E94335]">{user.failedMatches || 0}</p></div>
            </div>

            <button onClick={() => router.push("/scout")}
              className="w-full bg-gradient-to-r from-[#F9A825] to-[#FBBB05] text-white px-6 py-3 rounded-xl font-bold text-sm hover:shadow-lg transition-all">
              🕵️ Go to Scout Mode
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
