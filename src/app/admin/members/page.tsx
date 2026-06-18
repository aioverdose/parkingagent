"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

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

export default function AdminMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  useEffect(() => {
    api.get<{ members: Member[] }>("/api/admin/members").then((data) => setMembers(data.members));
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    await api.patch(`/api/admin/members/${id}`, { status });
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
  };

  const filtered = members.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || m.status === statusFilter;
    const matchesType = typeFilter === "all" || m.membershipType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      "good-standing": "bg-[#E6F4EA] text-[#0F9D58]",
      suspended: "bg-[#FCE8E6] text-[#E94335]",
      pending: "bg-[#FFF8E1] text-[#FBBB05]",
    };
    return styles[status] || "bg-gray-100 text-[#757575]";
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#202124] mb-6">Members</h1>

      {selectedMember ? (
        <div>
          <button onClick={() => setSelectedMember(null)} className="text-sm text-[#4285F4] hover:underline mb-4 inline-block">&larr; Back to all members</button>
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm max-w-lg">
            <h2 className="text-xl font-bold text-[#202124]">{selectedMember.name}</h2>
            <p className="text-sm text-[#757575]">{selectedMember.email}</p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#757575]">Status</span>
                <span className={`font-semibold px-2 py-0.5 rounded ${statusBadge(selectedMember.status)}`}>{selectedMember.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#757575]">Ranking Score</span>
                <span className="font-bold text-[#4285F4]">{selectedMember.rankingScore}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#757575]">Membership</span>
                <span className="font-medium">{selectedMember.membershipType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#757575]">Joined</span>
                <span className="font-medium">{selectedMember.joinedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#757575]">Courses</span>
                <span className={`font-semibold ${selectedMember.completedCourses ? "text-[#0F9D58]" : "text-[#E94335]"}`}>
                  {selectedMember.completedCourses ? "Completed" : "Incomplete"}
                </span>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              {selectedMember.status !== "good-standing" && (
                <button onClick={() => { handleStatusChange(selectedMember.id, "good-standing"); setSelectedMember({ ...selectedMember, status: "good-standing" }); }}
                  className="bg-[#0F9D58] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#34A853]">Approve</button>
              )}
              {selectedMember.status !== "suspended" && (
                <button onClick={() => { handleStatusChange(selectedMember.id, "suspended"); setSelectedMember({ ...selectedMember, status: "suspended" }); }}
                  className="bg-[#E94335] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#D32F2F]">Suspend</button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input type="text" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] outline-none" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] outline-none">
              <option value="all">All Status</option>
              <option value="good-standing">Good Standing</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#4285F4] outline-none">
              <option value="all">All Types</option>
              <option value="monthly">Monthly</option>
              <option value="annual">Annual</option>
              <option value="none">None</option>
            </select>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-semibold text-[#757575]">Name</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#757575] hidden sm:table-cell">Email</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#757575]">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#757575] hidden md:table-cell">Score</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#757575] hidden lg:table-cell">Type</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#757575] hidden lg:table-cell">Joined</th>
                    <th className="text-right px-4 py-3 font-semibold text-[#757575]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((member) => (
                    <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-[#202124]">{member.name}</td>
                      <td className="px-4 py-3 text-[#757575] hidden sm:table-cell">{member.email}</td>
                      <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded ${statusBadge(member.status)}`}>{member.status}</span></td>
                      <td className="px-4 py-3 font-bold text-[#4285F4] hidden md:table-cell">{member.rankingScore}</td>
                      <td className="px-4 py-3 text-[#757575] hidden lg:table-cell">{member.membershipType}</td>
                      <td className="px-4 py-3 text-[#757575] hidden lg:table-cell">{member.joinedDate}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setSelectedMember(member)} className="text-[#4285F4] hover:underline text-xs font-semibold">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && <p className="text-center text-[#BDBDBD] py-8">No members found.</p>}
          </div>
        </>
      )}
    </div>
  );
}
