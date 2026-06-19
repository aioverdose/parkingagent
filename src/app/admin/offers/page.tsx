"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface SpotOffer {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  latitude: number;
  longitude: number;
  address: string | null;
  status: string;
  createdAt: string;
}

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<SpotOffer[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<SpotOffer | null>(null);

  useEffect(() => {
    fetchOffers();
  }, [statusFilter]);

  async function fetchOffers() {
    try {
      const { offers } = await api.get<{ offers: SpotOffer[] }>(`/api/admin/offers?status=${statusFilter}`);
      setOffers(offers);
    } catch {
      // redirect to admin login
    }
  }

  const statusColors: Record<string, string> = {
    available: "text-[#0F9D58] bg-[#E6F4EA]",
    matched: "text-[#4285F4] bg-[#E8F0FE]",
    completed: "text-[#757575] bg-gray-100",
    expired: "text-[#E94335] bg-[#FCE8E6]",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#202124] mb-6">Spot Offers</h1>

      <div className="flex gap-2 mb-6">
        {["all", "available", "matched", "completed", "expired"].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium capitalize transition-colors ${
              statusFilter === s ? "bg-[#4285F4] text-white" : "bg-gray-100 text-[#757575] hover:bg-gray-200"
            }`}>{s}</button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 text-[#757575] font-semibold">Member</th>
                <th className="px-4 py-3 text-[#757575] font-semibold">Location</th>
                <th className="px-4 py-3 text-[#757575] font-semibold">Status</th>
                <th className="px-4 py-3 text-[#757575] font-semibold">Created</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {offers.map((offer) => (
                <tr key={offer.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#202124]">{offer.userName}</p>
                    <p className="text-xs text-[#757575]">{offer.userEmail}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[#202124]">{offer.address || `${offer.latitude.toFixed(4)}, ${offer.longitude.toFixed(4)}`}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColors[offer.status] || "bg-gray-100 text-[#757575]"}`}>
                      {offer.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#757575]">{new Date(offer.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelected(selected?.id === offer.id ? null : offer)}
                      className="text-xs text-[#4285F4] hover:underline">{selected?.id === offer.id ? "Close" : "View"}</button>
                  </td>
                </tr>
              ))}
              {offers.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-[#757575]">No offers found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-5">
          <h3 className="font-semibold text-sm text-[#202124] mb-3">Offer Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-[#757575]">Offer ID</span>
              <p className="text-[#202124] font-mono text-xs break-all">{selected.id}</p>
            </div>
            <div>
              <span className="text-[#757575]">Member</span>
              <p className="text-[#202124]">{selected.userName} ({selected.userEmail})</p>
            </div>
            <div>
              <span className="text-[#757575]">Latitude</span>
              <p className="text-[#202124]">{selected.latitude}</p>
            </div>
            <div>
              <span className="text-[#757575]">Longitude</span>
              <p className="text-[#202124]">{selected.longitude}</p>
            </div>
            <div>
              <span className="text-[#757575]">Address</span>
              <p className="text-[#202124]">{selected.address || "Not provided"}</p>
            </div>
            <div>
              <span className="text-[#757575]">Status</span>
              <p className="text-[#202124] capitalize">{selected.status}</p>
            </div>
            <div>
              <span className="text-[#757575]">Created</span>
              <p className="text-[#202124]">{new Date(selected.createdAt).toLocaleString()}</p>
            </div>
          </div>
          <a href={`https://maps.google.com/maps?q=${selected.latitude},${selected.longitude}`} target="_blank" rel="noopener noreferrer"
            className="mt-4 inline-block text-xs text-[#4285F4] hover:underline">Open in Google Maps →</a>
        </div>
      )}
    </div>
  );
}
