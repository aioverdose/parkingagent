"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface RevenueEntry {
  month: string;
  revenue: number;
}

interface FinancialData {
  totalMonthlyRevenue: number;
  totalAnnualRevenue: number;
  activeSubscriptions: number;
  newSignupsThisWeek: number;
  churnedMembersThisMonth: number;
  averageRevenuePerMember: number;
  revenueOverTime: RevenueEntry[];
  monthlySubscriptions: number;
  annualSubscriptions: number;
}

export default function AdminFinancials() {
  const [data, setData] = useState<FinancialData | null>(null);
  const [dateRange, setDateRange] = useState("month");

  useEffect(() => {
    api.get<{ financials: FinancialData }>("/api/admin/financials").then((res) => setData(res.financials));
  }, []);

  if (!data) return null;

  const maxRevenue = Math.max(...data.revenueOverTime.map((r) => r.revenue));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#202124]">Financials</h1>
        <div className="flex gap-2">
          {["week", "month", "year"].map((range) => (
            <button key={range} onClick={() => setDateRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                dateRange === range ? "bg-[#4285F4] text-white" : "bg-gray-100 text-[#757575] hover:bg-gray-200"
              }`}>
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Monthly Revenue", value: `$${data.totalMonthlyRevenue.toLocaleString()}`, color: "#0F9D58" },
          { label: "Annual Revenue", value: `$${data.totalAnnualRevenue.toLocaleString()}`, color: "#4285F4" },
          { label: "Active Subscriptions", value: data.activeSubscriptions, color: "#FBBB05" },
          { label: "Avg Revenue/Member", value: `$${data.averageRevenuePerMember}`, color: "#757575" },
        ].map((card) => (
          <div key={card.label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-[#757575] font-medium uppercase tracking-wide">{card.label}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: card.color }}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-[#202124] mb-4">Revenue Over Time</h3>
          <div className="h-48 flex items-end gap-3">
            {data.revenueOverTime.map((entry) => (
              <div key={entry.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-[#BDBDBD] font-medium">${entry.revenue}</span>
                <div className="w-full rounded-t-md transition-all hover:opacity-80"
                  style={{ height: `${(entry.revenue / maxRevenue) * 100}%`, backgroundColor: "#4285F4", minHeight: 8 }} />
                <span className="text-[10px] text-[#757575] font-medium">{entry.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-[#202124] mb-4">Subscription Breakdown</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#757575]">Monthly</span>
                <span className="font-semibold">{data.monthlySubscriptions} ({Math.round((data.monthlySubscriptions / data.activeSubscriptions) * 100)}%)</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div className="bg-[#4285F4] h-3 rounded-full transition-all"
                  style={{ width: `${(data.monthlySubscriptions / data.activeSubscriptions) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#757575]">Annual</span>
                <span className="font-semibold">{data.annualSubscriptions} ({Math.round((data.annualSubscriptions / data.activeSubscriptions) * 100)}%)</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div className="bg-[#0F9D58] h-3 rounded-full transition-all"
                  style={{ width: `${(data.annualSubscriptions / data.activeSubscriptions) * 100}%` }} />
              </div>
            </div>
            <div className="pt-3 border-t border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-[#757575]">New Signups (this week)</span>
                <span className="font-bold text-[#0F9D58]">+{data.newSignupsThisWeek}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-[#757575]">Churned (this month)</span>
                <span className="font-bold text-[#E94335]">-{data.churnedMembersThisMonth}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h3 className="font-semibold text-[#202124] mb-4">Export</h3>
        <div className="flex gap-3">
          <button className="bg-[#4285F4] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#1A73E8] transition-colors">Export to CSV</button>
          <button className="border border-[#4285F4] text-[#4285F4] px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#E8F0FE] transition-colors">Export to PDF</button>
        </div>
      </div>
    </div>
  );
}
