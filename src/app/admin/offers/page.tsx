"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface SpotOffer { id: string; userId: string; userName: string; userEmail: string; latitude: number; longitude: number; address: string | null; status: string; createdAt: string; }

const badgeVariant = (s: string) =>
  s === "available" ? "success" as const : s === "matched" ? "info" as const : s === "completed" ? "default" as const : "error" as const;

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<SpotOffer[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<SpotOffer | null>(null);

  useEffect(() => { fetchOffers(); }, [statusFilter]);
  async function fetchOffers() { try { const { offers } = await api.get<{ offers: SpotOffer[] }>(`/api/admin/offers?status=${statusFilter}`); setOffers(offers); } catch {} }

  return (
    <div>
      <h1 className="text-xl font-bold text-[#202124] mb-4">Spot Offers</h1>
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {["all", "available", "matched", "completed", "expired"].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`text-[10px] px-2.5 py-1.5 rounded-lg font-medium capitalize transition-colors ${
              statusFilter === s ? "bg-[#4285F4] text-white" : "bg-gray-100 text-[#757575] hover:bg-gray-200"
            }`}>{s}</button>
        ))}
      </div>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-3 py-2.5 font-semibold text-[#757575]">Member</th>
                <th className="px-3 py-2.5 font-semibold text-[#757575]">Location</th>
                <th className="px-3 py-2.5 font-semibold text-[#757575]">Status</th>
                <th className="px-3 py-2.5 font-semibold text-[#757575]">Created</th>
                <th className="px-3 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {offers.map((offer) => (
                <tr key={offer.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2.5"><span className="font-medium text-[#202124]">{offer.userName}</span><span className="text-[#757575] ml-1 text-[10px]">{offer.userEmail}</span></td>
                  <td className="px-3 py-2.5 text-[#757575]">{offer.address || `${offer.latitude.toFixed(4)}, ${offer.longitude.toFixed(4)}`}</td>
                  <td className="px-3 py-2.5"><Badge variant={badgeVariant(offer.status)}>{offer.status}</Badge></td>
                  <td className="px-3 py-2.5 text-[#757575]">{new Date(offer.createdAt).toLocaleDateString()}</td>
                  <td className="px-3 py-2.5"><button onClick={() => setSelected(selected?.id === offer.id ? null : offer)} className="text-[#4285F4] hover:underline text-[10px]">{selected?.id === offer.id ? "Close" : "View"}</button></td>
                </tr>
              ))}
              {offers.length === 0 && <tr><td colSpan={5} className="px-3 py-6 text-center text-[#757575] text-xs">No offers found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      {selected && (
        <Card className="mt-4">
          <h3 className="font-semibold text-xs text-[#202124] mb-2">Offer Details</h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div><span className="text-[#757575]">Offer ID</span><p className="text-[#202124] font-mono text-[10px] break-all">{selected.id}</p></div>
            <div><span className="text-[#757575]">Member</span><p className="text-[#202124]">{selected.userName} ({selected.userEmail})</p></div>
            <div><span className="text-[#757575]">Latitude</span><p className="text-[#202124]">{selected.latitude}</p></div>
            <div><span className="text-[#757575]">Longitude</span><p className="text-[#202124]">{selected.longitude}</p></div>
            <div><span className="text-[#757575]">Address</span><p className="text-[#202124]">{selected.address || "Not provided"}</p></div>
            <div><span className="text-[#757575]">Status</span><p className="text-[#202124] capitalize">{selected.status}</p></div>
            <div><span className="text-[#757575]">Created</span><p className="text-[#202124]">{new Date(selected.createdAt).toLocaleString()}</p></div>
          </div>
          <a href={`https://maps.google.com/maps?q=${selected.latitude},${selected.longitude}`} target="_blank" rel="noopener noreferrer"
            className="mt-2 inline-block text-[10px] text-[#4285F4] hover:underline">Open in Google Maps →</a>
        </Card>
      )}
    </div>
  );
}
