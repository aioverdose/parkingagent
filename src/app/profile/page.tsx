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
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
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

  // Parking match state
  const [leavingTime, setLeavingTime] = useState("");
  const [arrivalLookingTime, setArrivalLookingTime] = useState("");
  const [pmMessage, setPmMessage] = useState("");
  const [pmError, setPmError] = useState("");
  const [pmLoading, setPmLoading] = useState(false);
  const [parkingMatches, setParkingMatches] = useState<ParkingMatch[]>([]);

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
      }
    });
    fetchParkingMatches();
  }, []);

  async function fetchParkingMatches() {
    try {
      const { matches } = await api.get<{ matches: ParkingMatch[] }>("/api/parking-match/my-matches");
      setParkingMatches(matches);
    } catch {}
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    try {
      const { user: updated } = await api.put<{ user: any }>("/api/auth/profile", {
        name,
        email,
        vehicleType: vehicleType || undefined,
        vehicleSize: vehicleSize || undefined,
        vehicleMake: vehicleMake || undefined,
        vehicleModel: vehicleModel || undefined,
        licensePlate: licensePlate || undefined,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });
      if (updated) {
        localStorage.setItem("parking_agent_auth", JSON.stringify(updated));
        setUser(updated);
        setMessage("Profile updated successfully");
        setCurrentPassword("");
        setNewPassword("");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    }
    setLoading(false);
  }

  async function handleParkingMatchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPmMessage("");
    setPmError("");
    if (!leavingTime || !arrivalLookingTime) {
      setPmError("Both leaving time and arrival time are required.");
      return;
    }
    setPmLoading(true);
    try {
      const { message } = await api.post<{ message: string }>("/api/parking-match-schedule", {
        leavingTime,
        arrivalLookingTime,
      });
      setPmMessage(message);
      setLeavingTime("");
      setArrivalLookingTime("");
      fetchParkingMatches();
    } catch (err: any) {
      setPmError(err.message || "Failed to submit schedule.");
    }
    setPmLoading(false);
  }

  async function handleConfirmMatch(matchId: string) {
    try {
      await api.post("/api/parking-match/confirm", { matchId });
      fetchParkingMatches();
    } catch {
      setPmError("Failed to confirm match.");
    }
  }

  async function handleCancelMatch(matchId: string) {
    try {
      await api.post("/api/parking-match/cancel", { matchId });
      fetchParkingMatches();
    } catch {
      setPmError("Failed to cancel match.");
    }
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
            <p className="text-[#757575] text-center mt-1 text-sm">Update your name, email, or password</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              {message && <p className="text-sm text-[#0F9D58] bg-[#E6F4EA] p-3 rounded-xl">{message}</p>}
              {error && <p className="text-sm text-[#E94335] bg-[#FCE8E6] p-3 rounded-xl">{error}</p>}

              <div>
                <label className="block text-sm font-medium text-[#202124] mb-1">Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#202124] mb-1">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] outline-none" />
              </div>
              <hr className="my-4" />
              <h2 className="text-lg font-semibold text-[#202124]">Vehicle Info</h2>
              <p className="text-xs text-[#757575] -mt-3 mb-4">Used for spot compatibility matching</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#202124] mb-1">Type</label>
                  <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] outline-none bg-white">
                    <option value="">Any</option>
                    <option value="car">Car</option>
                    <option value="motorcycle">Motorcycle</option>
                    <option value="bike">Bike</option>
                    <option value="truck">Truck</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#202124] mb-1">Size</label>
                  <select value={vehicleSize} onChange={(e) => setVehicleSize(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] outline-none bg-white">
                    <option value="">Any</option>
                    <option value="compact">Compact</option>
                    <option value="standard">Standard</option>
                    <option value="large">Large</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#202124] mb-1">Make</label>
                  <input type="text" value={vehicleMake} onChange={(e) => setVehicleMake(e.target.value)} placeholder="e.g. Toyota"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#202124] mb-1">Model</label>
                  <input type="text" value={vehicleModel} onChange={(e) => setVehicleModel(e.target.value)} placeholder="e.g. Camry"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#202124] mb-1">License Plate</label>
                <input type="text" value={licensePlate} onChange={(e) => setLicensePlate(e.target.value)} placeholder="ABC1234"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] outline-none" />
              </div>
              <hr className="my-4" />
              <h2 className="text-lg font-semibold text-[#202124]">Change Password</h2>
              <p className="text-xs text-[#757575] -mt-3 mb-4">Leave blank to keep current password</p>
              <div>
                <label className="block text-sm font-medium text-[#202124] mb-1">Current Password</label>
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#202124] mb-1">New Password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] outline-none" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-[#4285F4] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#1A73E8] transition-colors disabled:opacity-50">
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>

          {/* Free Schedule-Based Parking Matching */}
          <div>
            <hr className="mb-6" />
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-semibold text-[#202124]">Free Schedule-Based Parking Matching</h2>
              <span className="text-[10px] bg-[#E6F4EA] text-[#0F9D58] font-semibold px-2 py-0.5 rounded-full">Free</span>
            </div>
            <p className="text-xs text-[#757575] mb-4">
              Submit your normal departure and arrival times to get matched with someone who has the opposite schedule.
            </p>

            <form onSubmit={handleParkingMatchSubmit} className="space-y-4">
              {pmMessage && <p className="text-sm text-[#0F9D58] bg-[#E6F4EA] p-3 rounded-xl">{pmMessage}</p>}
              {pmError && <p className="text-sm text-[#E94335] bg-[#FCE8E6] p-3 rounded-xl">{pmError}</p>}

              <div>
                <label className="block text-sm font-medium text-[#202124] mb-1">Time you leave your parking spot</label>
                <input type="time" value={leavingTime} onChange={(e) => setLeavingTime(e.target.value)}
                  placeholder="e.g., 17:30"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#202124] mb-1">Time you arrive back in your neighborhood and are looking for a spot</label>
                <input type="time" value={arrivalLookingTime} onChange={(e) => setArrivalLookingTime(e.target.value)}
                  placeholder="e.g., 08:00"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] outline-none" />
              </div>
              <HoverButton type="submit" disabled={pmLoading} className="w-full">
                {pmLoading ? "Submitting..." : "Submit Schedule"}
              </HoverButton>
            </form>

            {/* Parking Matches List */}
            {parkingMatches.length > 0 && (
              <div className="mt-6 space-y-3">
                <h3 className="font-semibold text-sm text-[#202124]">Your pre-scheduled parking connections</h3>
                {parkingMatches.map((m) => {
                  const isLeaver = m.leavingMemberId === user?.id;
                  const statusVariant = m.status === "confirmed" ? "success" : m.status === "cancelled" ? "error" : "warning";
                  return (
                    <HoverCard key={m.matchId} className="text-sm">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={statusVariant}>{m.status}</Badge>
                        <span className="text-[10px] text-[#757575]">{new Date(m.matchedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="space-y-1 text-xs text-[#757575]">
                        <p>
                          <span className="text-[#202124] font-medium">{isLeaver ? "You leave" : "Partner leaves"}:</span>{" "}
                          {formatTime(m.leavingTime)}
                        </p>
                        <p>
                          <span className="text-[#202124] font-medium">{isLeaver ? "Partner arrives" : "You arrive"}:</span>{" "}
                          {formatTime(m.arrivalLookingTime)}
                        </p>
                        <p className="text-[#4285F4]">{m.anonymousPartner}</p>
                        {m.partnerVehicleInfo && (m.partnerVehicleInfo.type || m.partnerVehicleInfo.size) && (
                          <p>
                            Vehicle: {m.partnerVehicleInfo.type || "any"} / {m.partnerVehicleInfo.size || "any"}
                          </p>
                        )}
                        {m.status === "pending" && (
                          <div className="flex gap-2 mt-2">
                            <button onClick={() => handleConfirmMatch(m.matchId)}
                              className="text-xs bg-[#0F9D58] text-white px-3 py-1.5 rounded-lg font-medium hover:bg-[#34A853]">
                              Confirm
                            </button>
                            <button onClick={() => handleCancelMatch(m.matchId)}
                              className="text-xs border border-gray-300 text-[#757575] px-3 py-1.5 rounded-lg font-medium hover:bg-gray-50">
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </HoverCard>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
