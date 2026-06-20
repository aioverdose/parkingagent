"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface Member { id: string; name: string; email: string; status: string; rankingScore: number; membershipType: string; completedCourses: boolean; joinedDate: string; }

export default function AdminMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selected, setSelected] = useState<Member | null>(null);

  useEffect(() => { api.get<{ members: Member[] }>("/api/admin/members").then((d) => setMembers(d.members)); }, []);

  const handleStatusChange = async (id: string, status: string) => {
    await api.patch(`/api/admin/members/${id}`, { status });
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
  };

  const filtered = members.filter((m) => {
    const q = search.toLowerCase();
    return (m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)) &&
      (statusFilter === "all" || m.status === statusFilter) &&
      (typeFilter === "all" || m.membershipType === typeFilter);
  });

  const badgeVariant = (s: string) => s === "good-standing" ? "success" as const : s === "suspended" ? "error" as const : "warning" as const;

  return (
    <div>
      <h1 className="text-xl font-bold text-[#202124] mb-4">Members</h1>
      {selected ? (
        <div>
          <button onClick={() => setSelected(null)} className="text-xs text-[#4285F4] hover:underline mb-3">&larr; Back</button>
          <Card className="max-w-md">
            <h2 className="font-bold text-[#202124]">{selected.name}</h2>
            <p className="text-xs text-[#757575]">{selected.email}</p>
            <div className="mt-3 space-y-2 text-xs">
              {[
                ["Status", <Badge key="s" variant={badgeVariant(selected.status)}>{selected.status}</Badge>],
                ["Score", <span key="sc" className="font-bold text-[#4285F4]">{selected.rankingScore}</span>],
                ["Membership", selected.membershipType],
                ["Joined", selected.joinedDate],
                ["Courses", <span key="c" className={`font-semibold ${selected.completedCourses ? "text-[#0F9D58]" : "text-[#E94335]"}`}>{selected.completedCourses ? "Completed" : "Incomplete"}</span>],
              ].map(([label, value]) => (
                <div key={label as string} className="flex justify-between"><span className="text-[#757575]">{label as string}</span><span className="font-medium">{value as React.ReactNode}</span></div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              {selected.status !== "good-standing" && <button onClick={() => { handleStatusChange(selected.id, "good-standing"); setSelected({ ...selected, status: "good-standing" }); }} className="bg-[#0F9D58] text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#34A853]">Approve</button>}
              {selected.status !== "suspended" && <button onClick={() => { handleStatusChange(selected.id, "suspended"); setSelected({ ...selected, status: "suspended" }); }} className="bg-[#E94335] text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#D32F2F]">Suspend</button>}
            </div>
          </Card>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input type="text" placeholder="Search name or email..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#4285F4] outline-none" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#4285F4] outline-none">
              <option value="all">All Status</option>
              <option value="good-standing">Good Standing</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#4285F4] outline-none">
              <option value="all">All Types</option>
              <option value="monthly">Monthly</option>
              <option value="annual">Annual</option>
              <option value="none">None</option>
            </select>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-3 py-2.5 font-semibold text-[#757575]">Name</th>
                    <th className="text-left px-3 py-2.5 font-semibold text-[#757575] hidden sm:table-cell">Email</th>
                    <th className="text-left px-3 py-2.5 font-semibold text-[#757575]">Status</th>
                    <th className="text-left px-3 py-2.5 font-semibold text-[#757575] hidden md:table-cell">Score</th>
                    <th className="text-left px-3 py-2.5 font-semibold text-[#757575] hidden lg:table-cell">Type</th>
                    <th className="text-right px-3 py-2.5 font-semibold text-[#757575]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => (
                    <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-2.5 font-medium text-[#202124]">{m.name}</td>
                      <td className="px-3 py-2.5 text-[#757575] hidden sm:table-cell">{m.email}</td>
                      <td className="px-3 py-2.5"><Badge variant={badgeVariant(m.status)}>{m.status}</Badge></td>
                      <td className="px-3 py-2.5 font-bold text-[#4285F4] hidden md:table-cell">{m.rankingScore}</td>
                      <td className="px-3 py-2.5 text-[#757575] hidden lg:table-cell">{m.membershipType}</td>
                      <td className="px-3 py-2.5 text-right"><button onClick={() => setSelected(m)} className="text-[#4285F4] hover:underline text-[10px] font-semibold">View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && <p className="text-center text-[#BDBDBD] py-6 text-xs">No members found.</p>}
          </div>
        </>
      )}
    </div>
  );
}
