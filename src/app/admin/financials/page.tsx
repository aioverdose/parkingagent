"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { BarChart } from "@/components/ui/Chart";

interface RevenueEntry { month: string; revenue: number; }
interface FinancialData {
  totalMonthlyRevenue: number; totalAnnualRevenue: number; activeSubscriptions: number;
  newSignupsThisWeek: number; churnedMembersThisMonth: number; averageRevenuePerMember: number;
  revenueOverTime: RevenueEntry[]; monthlySubscriptions: number; annualSubscriptions: number;
}

export default function AdminFinancials() {
  const [data, setData] = useState<FinancialData | null>(null);
  const [dateRange, setDateRange] = useState("month");

  useEffect(() => { api.get<{ financials: FinancialData }>("/api/admin/financials").then((r) => setData(r.financials)); }, []);

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#202124]">Financials</h1>
        <div className="flex gap-1.5">
          {["week", "month", "year"].map((r) => (
            <button key={r} onClick={() => setDateRange(r)}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-colors ${dateRange === r ? "bg-[#4285F4] text-white" : "bg-gray-100 text-[#757575] hover:bg-gray-200"}`}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="Monthly Revenue" value={`$${data.totalMonthlyRevenue.toLocaleString()}`} color="#0F9D58" />
        <MetricCard label="Annual Revenue" value={`$${data.totalAnnualRevenue.toLocaleString()}`} color="#4285F4" />
        <MetricCard label="Active Subscriptions" value={data.activeSubscriptions} color="#FBBB05" />
        <MetricCard label="Avg Revenue/Member" value={`$${data.averageRevenuePerMember}`} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Revenue Over Time">
          <BarChart data={data.revenueOverTime.map((r) => ({ label: r.month, value: r.revenue }))} height={160} />
        </Card>

        <Card title="Subscription Breakdown">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#757575]">Monthly</span>
                <span className="font-semibold">{data.monthlySubscriptions} ({Math.round((data.monthlySubscriptions / data.activeSubscriptions) * 100)}%)</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-[#4285F4] h-2 rounded-full" style={{ width: `${(data.monthlySubscriptions / data.activeSubscriptions) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#757575]">Annual</span>
                <span className="font-semibold">{data.annualSubscriptions} ({Math.round((data.annualSubscriptions / data.activeSubscriptions) * 100)}%)</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-[#0F9D58] h-2 rounded-full" style={{ width: `${(data.annualSubscriptions / data.activeSubscriptions) * 100}%` }} />
              </div>
            </div>
            <div className="pt-2 border-t border-gray-100 space-y-1">
              <div className="flex justify-between text-xs"><span className="text-[#757575]">New Signups (this week)</span><span className="font-bold text-[#0F9D58]">+{data.newSignupsThisWeek}</span></div>
              <div className="flex justify-between text-xs"><span className="text-[#757575]">Churned (this month)</span><span className="font-bold text-[#E94335]">-{data.churnedMembersThisMonth}</span></div>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Export">
        <div className="flex gap-2">
          <button onClick={() => exportCSV(data)} className="bg-[#4285F4] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#1A73E8]">Export CSV</button>
          <button onClick={() => exportPDF(data)} className="border border-[#4285F4] text-[#4285F4] px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#E8F0FE]">Export PDF</button>
        </div>
      </Card>
    </div>
  );
}

function exportCSV(data: FinancialData) {
  const rows = [["Metric", "Value"],
    ["Monthly Revenue", `$${data.totalMonthlyRevenue}`],
    ["Annual Revenue", `$${data.totalAnnualRevenue}`],
    ["Active Subscriptions", data.activeSubscriptions],
    ["Monthly Subscriptions", data.monthlySubscriptions],
    ["Annual Subscriptions", data.annualSubscriptions],
    ["Avg Revenue/Member", `$${data.averageRevenuePerMember}`],
    ["New Signups/Week", data.newSignupsThisWeek],
    ["Churned/Month", data.churnedMembersThisMonth],
    ...data.revenueOverTime.map((r) => [`Revenue (${r.month})`, `$${r.revenue}`]),
  ];
  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = `parking-agent-financials-${new Date().toISOString().split("T")[0]}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

function exportPDF(data: FinancialData) {
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`<html><head><title>Parking Agent Financials</title><style>
    body { font-family: system-ui, sans-serif; padding: 40px; color: #202124; }
    h1 { font-size: 24px; margin-bottom: 4px; }
    .subtitle { color: #757575; font-size: 14px; margin-bottom: 24px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .card { border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; }
    .card-label { font-size: 12px; color: #757575; text-transform: uppercase; letter-spacing: 0.5px; }
    .card-value { font-size: 24px; font-weight: bold; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid #e0e0e0; font-size: 14px; }
    th { color: #757575; font-weight: 600; }
    .footer { margin-top: 32px; font-size: 12px; color: #bdbdbd; }
  </style></head><body>
    <h1>Parking Agent Financials</h1>
    <p class="subtitle">Generated ${new Date().toLocaleDateString()}</p>
    <div class="grid">
      <div class="card"><div class="card-label">Monthly Revenue</div><div class="card-value" style="color:#0F9D58">$${data.totalMonthlyRevenue.toLocaleString()}</div></div>
      <div class="card"><div class="card-label">Annual Revenue</div><div class="card-value" style="color:#4285F4">$${data.totalAnnualRevenue.toLocaleString()}</div></div>
      <div class="card"><div class="card-label">Active Subscriptions</div><div class="card-value" style="color:#FBBB05">${data.activeSubscriptions}</div></div>
      <div class="card"><div class="card-label">Avg Revenue/Member</div><div class="card-value" style="color:#757575">$${data.averageRevenuePerMember}</div></div>
    </div>
    <h2 style="font-size:18px;margin-bottom:12px">Revenue Over Time</h2>
    <table><tr><th>Month</th><th>Revenue</th></tr>${data.revenueOverTime.map((r) => `<tr><td>${r.month}</td><td>$${r.revenue.toLocaleString()}</td></tr>`).join("")}</table>
    <h2 style="font-size:18px;margin:24px 0 12px">Subscription Summary</h2>
    <table><tr><th>Metric</th><th>Value</th></tr>
      <tr><td>Monthly Subscriptions</td><td>${data.monthlySubscriptions}</td></tr>
      <tr><td>Annual Subscriptions</td><td>${data.annualSubscriptions}</td></tr>
      <tr><td>New Signups (This Week)</td><td>${data.newSignupsThisWeek}</td></tr>
      <tr><td>Churned (This Month)</td><td>${data.churnedMembersThisMonth}</td></tr>
    </table>
    <p class="footer">Parking Agent — Confidential</p>
    <script>window.print()</script>
  </body></html>`);
  win.document.close();
}
