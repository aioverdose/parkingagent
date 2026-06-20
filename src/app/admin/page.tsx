"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MetricCard } from "@/components/ui/MetricCard";

interface SystemMetrics {
  totalMembers: number; activeMembers: number; totalSpotOffers: number;
  activeMatches: number; matchesCompletedToday: number; matchesExpiredCancelledToday: number;
  averageMatchTimeSeconds: number; averageArrivalTimeMinutes: number;
}

interface FinancialData {
  totalMonthlyRevenue: number; activeSubscriptions: number;
  newSignupsThisWeek: number; churnedMembersThisMonth: number;
  revenueOverTime: { month: string; revenue: number }[];
  monthlySubscriptions: number; annualSubscriptions: number;
}

interface Member { id: string; name: string; email: string; status: string; rankingScore: number; membershipType: string; completedCourses: boolean; joinedDate: string; }
interface CourseModule { id: string; title: string; description: string; isActive: boolean; lastUpdated: string; }

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
    ]).then(([m, f, mr, mr2]) => {
      setMetrics(m.metrics); setFinancials(f.financials);
      const sorted = mr.members.sort((a, b) => new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime());
      setRecentMembers(sorted);
      setTopRanked([...mr.members].filter((m) => m.rankingScore > 0).sort((a, b) => b.rankingScore - a.rankingScore).slice(0, 5));
      setModules(mr2.modules);
    });
  }, []);

  if (!metrics || !financials) return null;

  const statusCounts = {
    "good-standing": recentMembers.filter((m) => m.status === "good-standing").length,
    suspended: recentMembers.filter((m) => m.status === "suspended").length,
    pending: recentMembers.filter((m) => m.status === "pending").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#202124]">Admin Overview</h1>
        <span className="text-[10px] text-[#BDBDBD]">{new Date().toLocaleDateString()}</span>
      </div>

      {/* System Metrics */}
      <div>
        <h2 className="text-xs font-semibold text-[#757575] uppercase tracking-wider mb-3">System</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricCard label="Total Members" value={metrics.totalMembers} color="#4285F4" />
          <MetricCard label="Active Members" value={metrics.activeMembers} color="#0F9D58" />
          <MetricCard label="Spot Offers" value={metrics.totalSpotOffers} color="#FBBB05" />
          <MetricCard label="Active Matches" value={metrics.activeMatches} color="#4285F4" />
          <MetricCard label="Completed Today" value={metrics.matchesCompletedToday} color="#0F9D58" />
          <MetricCard label="Expired/Cancelled" value={metrics.matchesExpiredCancelledToday} color="#E94335" />
          <MetricCard label="Avg Match Time" value={`${metrics.averageMatchTimeSeconds}s`} />
          <MetricCard label="Avg Arrival" value={`${metrics.averageArrivalTimeMinutes}min`} />
        </div>
      </div>

      {/* Financial */}
      <div>
        <h2 className="text-xs font-semibold text-[#757575] uppercase tracking-wider mb-3">Financial</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricCard label="Monthly Revenue" value={`$${financials.totalMonthlyRevenue.toLocaleString()}`} color="#0F9D58" />
          <MetricCard label="Active Subs" value={financials.activeSubscriptions} color="#4285F4" />
          <MetricCard label="Signups/Week" value={financials.newSignupsThisWeek} color="#FBBB05" />
          <MetricCard label="Churned/Month" value={financials.churnedMembersThisMonth} color="#E94335" />
        </div>
      </div>

      {/* Panels */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Recent Signups">
          <div className="space-y-2">
            {recentMembers.slice(0, 5).map((m) => (
              <div key={m.id} className="flex items-center justify-between text-xs">
                <div><span className="font-medium text-[#202124]">{m.name}</span><span className="text-[#BDBDBD] ml-2">{m.email}</span></div>
                <Badge variant={m.status === "good-standing" ? "success" : m.status === "suspended" ? "error" : "warning"}>{m.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Member Status">
          <div className="space-y-2">
            {[{ label: "Good Standing", count: statusCounts["good-standing"], color: "#0F9D58" },
              { label: "Suspended", count: statusCounts.suspended, color: "#E94335" },
              { label: "Pending", count: statusCounts.pending, color: "#FBBB05" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between text-xs">
                <span className="text-[#757575]">{item.label}</span>
                <span className="font-bold" style={{ color: item.color }}>{item.count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Top Ranked Members">
          <div className="space-y-2">
            {topRanked.map((m, i) => (
              <div key={m.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#E8F0FE] text-[#4285F4] text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                  <span className="font-medium text-[#202124]">{m.name}</span>
                </div>
                <span className="font-bold text-[#4285F4]">{m.rankingScore}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Course Modules">
          <div className="space-y-2">
            {modules.map((mod) => (
              <div key={mod.id} className="flex items-center justify-between text-xs">
                <div><span className="font-medium text-[#202124]">{mod.title}</span><span className="text-[#BDBDBD] ml-2">{mod.lastUpdated}</span></div>
                <Badge variant={mod.isActive ? "success" : "default"}>{mod.isActive ? "Active" : "Inactive"}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div className="flex flex-wrap gap-2">
          <a href="/admin/members" className="bg-[#4285F4] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#1A73E8] transition-colors">View Members</a>
          <a href="/admin/matches" className="bg-[#0F9D58] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#34A853] transition-colors">View Matches</a>
          <a href="/admin/cms" className="bg-[#FBBB05] text-[#202124] px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#F9A825] transition-colors">Edit CMS</a>
          <a href="/admin/financials" className="bg-[#757575] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#616161] transition-colors">Financials</a>
          <button onClick={async () => { setExpiring(true); try { const { expired } = await api.post<{ expired: number }>("/api/admin/expire-matches"); setExpireMsg(`Expired ${expired} match(es)`); } catch { setExpireMsg("Failed"); } setExpiring(false); setTimeout(() => setExpireMsg(""), 3000); }} disabled={expiring}
            className="bg-[#E94335] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#D32F2F] disabled:opacity-50">{expiring ? "..." : "Expire Stale"}</button>
        </div>
        {expireMsg && <p className="text-xs text-[#757575] mt-2">{expireMsg}</p>}
      </Card>
    </div>
  );
}
