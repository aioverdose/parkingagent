"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import type { ClusterMarker } from "@/components/InteractiveMap";

const InteractiveMap = dynamic(() => import("@/components/InteractiveMap"), { ssr: false });

interface MapDataPoint {
  lat: number;
  lng: number;
  label: string;
  type: "member" | "offer" | "anchor";
}

type LayerKey = "members" | "offers" | "anchors";

const LAYER_COLORS: Record<string, string> = {
  member: "#4285F4",
  offer: "#0F9D58",
  anchor: "#E94335",
};

export default function AdminMap() {
  const [layers, setLayers] = useState<Record<LayerKey, MapDataPoint[]>>({
    members: [],
    offers: [],
    anchors: [],
  });
  const [visibleLayers, setVisibleLayers] = useState<Record<LayerKey, boolean>>({
    members: true,
    offers: true,
    anchors: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [zoomToFit, setZoomToFit] = useState(0);

  const fetchData = useRef(async () => {
    try {
      setLoading(true);
      setError("");
      const [membersRes, offersRes, anchorsRes] = await Promise.all([
        fetch("/api/admin/map?type=members"),
        fetch("/api/admin/map?type=offers"),
        fetch("/api/admin/map?type=anchors"),
      ]);
      if (!membersRes.ok || !offersRes.ok || !anchorsRes.ok) {
        throw new Error("Failed to load map data");
      }
      const [members, offers, anchors] = await Promise.all([
        membersRes.json(),
        offersRes.json(),
        anchorsRes.json(),
      ]);
      setLayers({
        members: members.data ?? [],
        offers: offers.data ?? [],
        anchors: anchors.data ?? [],
      });
    } catch (e: any) {
      setError(e.message || "Failed to load map data");
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => { fetchData.current(); }, []);

  const toggleLayer = (key: LayerKey) => {
    setVisibleLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allMarkers: ClusterMarker[] = [];
  for (const key of Object.keys(visibleLayers) as LayerKey[]) {
    if (!visibleLayers[key]) continue;
    for (const pt of layers[key]) {
      allMarkers.push({
        lat: pt.lat,
        lng: pt.lng,
        label: pt.label,
        tooltip: `${pt.label} (${pt.type})`,
        color: LAYER_COLORS[pt.type] || "#4285F4",
      });
    }
  }

  const center =
    allMarkers.length > 0
      ? {
          lat: allMarkers.reduce((s, m) => s + m.lat, 0) / allMarkers.length,
          lng: allMarkers.reduce((s, m) => s + m.lng, 0) / allMarkers.length,
        }
      : { lat: 33.77, lng: -118.19 };

  const counts = {
    members: layers.members.length,
    offers: layers.offers.length,
    anchors: layers.anchors.length,
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-semibold text-[#202124] text-sm">Geo Map</h3>
        <div className="flex items-center gap-3 text-xs">
          {(["members", "offers", "anchors"] as LayerKey[]).map((key) => (
            <label key={key} className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={visibleLayers[key]}
                onChange={() => toggleLayer(key)}
                className="accent-[#4285F4]"
              />
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: LAYER_COLORS[key === "members" ? "member" : key === "offers" ? "offer" : "anchor"] }}
              />
              {key.charAt(0).toUpperCase() + key.slice(1)} ({counts[key]})
            </label>
          ))}
          <div className="flex gap-1">
            <button
              onClick={() => fetchData.current()}
              className="text-[#4285F4] hover:underline disabled:opacity-40"
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
            <button
              onClick={() => setZoomToFit((n) => n + 1)}
              className="text-[#4285F4] hover:underline ml-2"
            >
              Fit All
            </button>
          </div>
        </div>
      </div>
      {error && (
        <div className="px-4 py-2 text-xs text-[#E94335] bg-red-50">{error}</div>
      )}
      {allMarkers.length > 0 ? (
        <InteractiveMap center={center} onPinDrop={() => {}} clusterMarkers={allMarkers} className="w-full" />
      ) : loading ? (
        <div className="flex items-center justify-center py-16 text-sm text-[#757575]">Loading map data...</div>
      ) : (
        <div className="flex items-center justify-center py-16 text-sm text-[#757575]">No data with coordinates</div>
      )}
    </div>
  );
}
