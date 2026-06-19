"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, fetchCurrentUser } from "@/lib/auth";
import { api } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(getStoredUser());
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) { router.push("/signup"); return; }
    fetchCurrentUser().then((u) => {
      if (u) { setUser(u); setName(u.name); setEmail(u.email); }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    try {
      const { user: updated } = await api.put<{ user: any }>("/api/auth/profile", {
        name,
        email,
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

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
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
      </main>
    </div>
  );
}
