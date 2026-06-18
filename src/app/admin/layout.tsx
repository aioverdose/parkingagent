"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { fetchCurrentUser, logout, type AuthUser } from "@/lib/auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUser().then((u) => {
      if (!u || !u.isAdmin) {
        router.push("/admin/login");
      } else {
        setUser(u);
      }
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-[#E8F0FE] border-t-[#4285F4] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const navLinks = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/members", label: "Members" },
    { href: "/admin/matches", label: "Matches" },
    { href: "/admin/cms", label: "CMS" },
    { href: "/admin/financials", label: "Financials" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-6">
            <a href="/" className="text-lg font-bold tracking-tight">
              <span className="text-[#4285F4]">Parking</span>{" "}
              <span className="text-[#0F9D58]">Agent</span>
            </a>
            <span className="text-xs bg-[#E94335]/10 text-[#E94335] font-semibold px-2 py-0.5 rounded">Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#757575]">{user.email}</span>
            <a href="/dashboard" className="text-sm text-[#4285F4] hover:underline">Dashboard</a>
            <button
              onClick={async () => {
                await logout();
                router.push("/");
              }}
              className="text-sm text-[#E94335] hover:underline"
            >
              Sign out
            </button>
          </div>
        </div>
        <div className="border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 flex gap-6 overflow-x-auto">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href}
                className={`text-sm font-medium py-3 border-b-2 transition-colors whitespace-nowrap ${
                  pathname === link.href
                    ? "border-[#4285F4] text-[#4285F4]"
                    : "border-transparent text-[#757575] hover:text-[#202124]"
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
