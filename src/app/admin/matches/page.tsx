"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface MatchRecord {
  id: string;
  arrivingMemberName: string;
  arrivingMemberEmail: string;
  departingMemberName: string;
  departingMemberEmail: string;
  status: string;
  matchedAt: string;
  arrivalAt: string | null;
  spotAddress: string;
}

export default function AdminMatches() {
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedMatch, setSelectedMatch] = useState<MatchRecord | null>(null);

  useEffect(() => {
    api.get<{ matches: MatchRecord[] }>("/api/admin/matches").then((data) => setMatches(data.matches));
  }, []);

  const filtered = statusFilter === "all" ? matches : matches.filter((m) => m.status === statusFilter);

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: "bg-[#E8F0FE] text-[#4285F4]",
      completed: "bg-[#E6F4EA] text-[#0F9D58]",
      cancelled: "bg-[#FCE8E6] text-[#E94335]",
      expired: "bg-[#FFF8E1] text-[#FBBB05]",
    };
    return styles[status] || "bg-gray-100 text-[#757575]";
  };

  const MatchDetail = ({ match }: { match: MatchRecord }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm max-w-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[#202124]">Match #{match.id}</h2>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusBadge(match.status)}`}>{match.status}</span>
      </div>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-[#757575]">Arriving Member</span>
          <span className="font-medium text-[#202124]">{match.arrivingMemberName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#757575]">Spot Owner</span>
          <span className="font-medium text-[#202124]">{match.departingMemberName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#757575]">Spot Address</span>
          <span className="font-medium text-right max-w-[200px]">{match.spotAddress}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#757575]">Matched At</span>
          <span className="font-medium">{match.matchedAt}</span>
        </div>
        {match.arrivalAt && <div className="flex justify-between">
          <span className="text-[#757575]">Arrival Time</span>
          <span className="font-medium">{match.arrivalAt}</span>
        </div>}
        <div className="border-t border-gray-100 pt-3 mt-3">
          <div className="flex justify-between">
            <span className="text-[#757575]">Arriving Email</span>
            <span className="font-medium text-sm">{match.arrivingMemberEmail}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[#757575]">Owner Email</span>
            <span className="font-medium text-sm">{match.departingMemberEmail}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#202124] mb-6">Matches</h1>

      {selectedMatch ? (
        <div>
          <button onClick={() => setSelectedMatch(null)} className="text-sm text-[#4285F4] hover:underline mb-4 inline-block">&larr; Back to all matches</button>
          <MatchDetail match={selectedMatch} />
        </div>
      ) : (
        <>
          <div className="flex gap-4 mb-6">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] outline-none">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-semibold text-[#757575]">Match ID</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#757575]">Arriving</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#757575] hidden sm:table-cell">Owner</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#757575]">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#757575] hidden md:table-cell">Matched</th>
                    <th className="text-right px-4 py-3 font-semibold text-[#757575]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((match) => (
                    <tr key={match.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-[#757575]">{match.id}</td>
                      <td className="px-4 py-3 font-medium text-[#202124]">{match.arrivingMemberName}</td>
                      <td className="px-4 py-3 text-[#757575] hidden sm:table-cell">{match.departingMemberName}</td>
                      <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded ${statusBadge(match.status)}`}>{match.status}</span></td>
                      <td className="px-4 py-3 text-[#757575] text-xs hidden md:table-cell">{match.matchedAt}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setSelectedMatch(match)} className="text-[#4285F4] hover:underline text-xs font-semibold">Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && <p className="text-center text-[#BDBDBD] py-8">No matches found.</p>}
          </div>
        </>
      )}
    </div>
  );
}
