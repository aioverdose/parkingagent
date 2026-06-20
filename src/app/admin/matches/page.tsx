"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface MatchRecord { id: string; arrivingMemberName: string; arrivingMemberEmail: string; departingMemberName: string; departingMemberEmail: string; status: string; matchedAt: string; arrivalAt: string | null; spotAddress: string; }

const badgeVariant = (s: string) =>
  s === "active" ? "info" as const : s === "completed" ? "success" as const : s === "cancelled" ? "error" as const : s === "expired" ? "warning" as const : "default" as const;

export default function AdminMatches() {
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<MatchRecord | null>(null);

  useEffect(() => { api.get<{ matches: MatchRecord[] }>("/api/admin/matches").then((d) => setMatches(d.matches)); }, []);

  const filtered = statusFilter === "all" ? matches : matches.filter((m) => m.status === statusFilter);

  return (
    <div>
      <h1 className="text-xl font-bold text-[#202124] mb-4">Matches</h1>
      {selected ? (
        <div>
          <button onClick={() => setSelected(null)} className="text-xs text-[#4285F4] hover:underline mb-3">&larr; Back</button>
          <Card className="max-w-md">
            <div className="flex items-center justify-between mb-3"><h2 className="font-bold text-[#202124]">Match #{selected.id}</h2><Badge variant={badgeVariant(selected.status)}>{selected.status}</Badge></div>
            <div className="space-y-2 text-xs">
              {([["Arriving", selected.arrivingMemberName], ["Spot Owner", selected.departingMemberName], ["Address", selected.spotAddress], ["Matched At", selected.matchedAt], selected.arrivalAt ? ["Arrival", selected.arrivalAt] : null].filter(Boolean) as [string, string][]).map(([label, value]) => (
                <div key={label as string} className="flex justify-between"><span className="text-[#757575]">{label as string}</span><span className="font-medium text-right max-w-[200px]">{value as string}</span></div>
              ))}
              <div className="border-t border-gray-100 pt-2 mt-2">
                <div className="flex justify-between"><span className="text-[#757575]">Arriving Email</span><span className="font-medium">{selected.arrivingMemberEmail}</span></div>
                <div className="flex justify-between mt-1"><span className="text-[#757575]">Owner Email</span><span className="font-medium">{selected.departingMemberEmail}</span></div>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <>
          <div className="flex gap-2 mb-4">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#4285F4] outline-none">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-3 py-2.5 font-semibold text-[#757575]">Match ID</th>
                    <th className="text-left px-3 py-2.5 font-semibold text-[#757575]">Arriving</th>
                    <th className="text-left px-3 py-2.5 font-semibold text-[#757575] hidden sm:table-cell">Owner</th>
                    <th className="text-left px-3 py-2.5 font-semibold text-[#757575]">Status</th>
                    <th className="text-left px-3 py-2.5 font-semibold text-[#757575] hidden md:table-cell">Matched</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-[#757575]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((match) => (
                    <tr key={match.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-2.5 font-mono text-[10px] text-[#757575]">{match.id}</td>
                      <td className="px-3 py-2.5 font-medium text-[#202124]">{match.arrivingMemberName}</td>
                      <td className="px-3 py-2.5 text-[#757575] hidden sm:table-cell">{match.departingMemberName}</td>
                      <td className="px-3 py-2.5"><Badge variant={badgeVariant(match.status)}>{match.status}</Badge></td>
                      <td className="px-3 py-2.5 text-[#757575] text-[10px] hidden md:table-cell">{match.matchedAt}</td>
                      <td className="px-3 py-2.5 text-right"><button onClick={() => setSelected(match)} className="text-[#4285F4] hover:underline text-[10px] font-semibold">Details</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && <p className="text-center text-[#BDBDBD] py-6 text-xs">No matches found.</p>}
          </div>
        </>
      )}
    </div>
  );
}
