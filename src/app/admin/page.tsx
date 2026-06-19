"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface SystemMetrics {
  totalMembers: number;
  activeMembers: number;
  totalSpotOffers: number;
  activeMatches: number;
  matchesCompletedToday: number;
  matchesExpiredCancelledToday: number;
  averageMatchTimeSeconds: number;
  averageArrivalTimeMinutes: number;
}

interface FinancialData {
  totalMonthlyRevenue: number;
  activeSubscriptions: number;
  newSignupsThisWeek: number;
  churnedMembersThisMonth: number;
  revenueOverTime: { month: string; revenue: number }[];
  monthlySubscriptions: number;
  annualSubscriptions: number;
}

interface Member {
  id: string;
  name: string;
  email: string;
  status: string;
  rankingScore: number;
  membershipType: string;
  completedCourses: boolean;
  joinedDate: string;
}

interface CourseModule {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  lastUpdated: string;
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [financials, setFinancials] = useState<FinancialData | null>(null);
  const [recentMembers, setRecentMembers] = useState<Member[]>([]);
  const [topRanked, setTopRanked] = useState<Member[]>([]);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [expiring, setExpiring] = useState(false);
  const [expireMsg, setExpireMsg] = useState("");

  useEffect(() => {
    Promise.all([
      api.get<{ metrics: SystemMetrics }>("/api/admin/metrics"),
      api.get<{ financials: FinancialData }>("/api/admin/financials"),
      api.get<{ members: Member[] }>("/api/admin/members"),
      api.get<{ modules: CourseModule[] }>("/api/admin/cms/modules"),
    ]).then(([metricsRes, finRes, membersRes, modulesRes]) => {
      setMetrics(metricsRes.metrics);
      setFinancials(finRes.financials);
      const sorted = membersRes.members.sort(
        (a, b) => new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime(),
      );
      setRecentMembers(sorted);
      setTopRanked(
        [...membersRes.members]
          .filter((m) => m.rankingScore > 0)
          .sort((a, b) => b.rankingScore - a.rankingScore)
          .slice(0, 5),
      );
      setModules(modulesRes.modules);
    });
  }, []);

  if (!metrics || !financials) return null;

  const metricCards = [
    { label: "Total Members", value: metrics.totalMembers, color: "#4285F4" },
    { label: "Active Members", value: metrics.activeMembers, color: "#0F9D58" },
    { label: "Total Spot Offers", value: metrics.totalSpotOffers, color: "#FBBB05" },
    { label: "Active Matches", value: metrics.activeMatches, color: "#4285F4" },
    { label: "Completed Today", value: metrics.matchesCompletedToday, color: "#0F9D58" },
    { label: "Expired/Cancelled Today", value: metrics.matchesExpiredCancelledToday, color: "#E94335" },
    { label: "Avg Match Time", value: `${metrics.averageMatchTimeSeconds}s`, color: "#757575" },
    { label: "Avg Arrival Time", value: `${metrics.averageArrivalTimeMinutes}min`, color: "#757575" },
  ];

  const financialCards = [
    { label: "Monthly Revenue", value: `$${financials.totalMonthlyRevenue.toLocaleString()}`, color: "#0F9D58" },
    { label: "Active Subs", value: financials.activeSubscriptions, color: "#4285F4" },
    { label: "New Signups/Week", value: financials.newSignupsThisWeek, color: "#FBBB05" },
    { label: "Churned/Month", value: financials.churnedMembersThisMonth, color: "#E94335" },
  ];

  const statusCounts = {
    "good-standing": recentMembers.filter((m) => m.status === "good-standing").length,
    suspended: recentMembers.filter((m) => m.status === "suspended").length,
    pending: recentMembers.filter((m) => m.status === "pending").length,
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#202124]">Admin Dashboard</h1>
        <span className="text-xs text-[#BDBDBD]">Last updated: {new Date().toLocaleDateString()}</span>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-[#202124] mb-4">System Metrics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {metricCards.map((card) => (
            <div key={card.label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-[#757575] font-medium uppercase tracking-wide">{card.label}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: card.color }}>{card.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-[#202124] mb-4">Financial Metrics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {financialCards.map((card) => (
            <div key={card.label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-[#757575] font-medium uppercase tracking-wide">{card.label}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: card.color }}>{card.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-[#202124] mb-4">Recent Member Signups (14 days)</h3>
          <div className="space-y-3">
            {recentMembers.slice(0, 5).map((member) => (
              <div key={member.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-[#202124]">{member.name}</p>
                  <p className="text-[#BDBDBD] text-xs">{member.email}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                  member.status === "good-standing" ? "bg-[#E6F4EA] text-[#0F9D58]"
                    : member.status === "suspended" ? "bg-[#FCE8E6] text-[#E94335]"
                    : "bg-[#FFF8E1] text-[#FBBB05]"
                }`}>{member.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-[#202124] mb-4">Member Status Overview</h3>
          <div className="space-y-3">
            {[
              { label: "Good Standing", count: statusCounts["good-standing"], color: "#0F9D58" },
              { label: "Suspended", count: statusCounts.suspended, color: "#E94335" },
              { label: "Pending", count: statusCounts.pending, color: "#FBBB05" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <span className="text-[#757575]">{item.label}</span>
                <span className="font-bold" style={{ color: item.color }}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-[#202124] mb-4">Top Ranked Members</h3>
          <div className="space-y-3">
            {topRanked.map((member, i) => (
              <div key={member.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#E8F0FE] text-[#4285F4] text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  <span className="font-medium text-[#202124]">{member.name}</span>
                </div>
                <span className="font-bold text-[#4285F4]">{member.rankingScore}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-[#202124] mb-4">Active Course Modules</h3>
          <div className="space-y-3">
            {modules.map((mod) => (
              <div key={mod.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-[#202124]">{mod.title}</p>
                  <p className="text-[#BDBDBD] text-xs">Last updated: {mod.lastUpdated}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                  mod.isActive ? "bg-[#E6F4EA] text-[#0F9D58]" : "bg-gray-100 text-[#757575]"
                }`}>{mod.isActive ? "Active" : "Inactive"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h3 className="font-semibold text-[#202124] mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <a href="/admin/members" className="bg-[#4285F4] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#1A73E8] transition-colors">View All Members</a>
          <a href="/admin/matches" className="bg-[#0F9D58] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#34A853] transition-colors">View All Matches</a>
          <a href="/admin/cms" className="bg-[#FBBB05] text-[#202124] px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#F9A825] transition-colors">Edit CMS Content</a>
          <a href="/admin/financials" className="bg-[#757575] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#616161] transition-colors">View Financial Reports</a>
          <button onClick={async () => {
            setExpiring(true);
            try {
              const { expired } = await api.post<{ expired: number }>("/api/admin/expire-matches");
              setExpireMsg(`Expired ${expired} stale match(es)`);
            } catch {
              setExpireMsg("Failed to expire matches");
            }
            setExpiring(false);
            setTimeout(() => setExpireMsg(""), 3000);
          }} disabled={expiring}
            className="bg-[#E94335] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#D32F2F] transition-colors disabled:opacity-50">
            {expiring ? "Expiring..." : "Expire Stale Matches"}
          </button>
        </div>
        {expireMsg && <p className="text-sm text-[#757575] mt-2">{expireMsg}</p>}
        </div>
    </div>
  );
}
