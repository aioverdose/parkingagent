"use client";

import { useEffect, useRef } from "react";

export interface PinPosition {
  lat: number;
  lng: number;
}

export interface GeofenceCircle {
  center: PinPosition;
  radiusMeters: number;
  color?: string;
}

export interface ClusterMarker {
  lat: number;
  lng: number;
  label?: string;
  tooltip?: string;
  color?: string;
}

export default function InteractiveMap({
  center,
  onPinDrop,
  pinPosition,
  livePosition,
  spotPosition,
  geofence,
  clusterMarkers,
  className = "",
}: {
  center: PinPosition;
  onPinDrop: (lat: number, lng: number) => void;
  pinPosition?: PinPosition | null;
  livePosition?: PinPosition | null;
  spotPosition?: PinPosition | null;
  geofence?: GeofenceCircle | null;
  clusterMarkers?: ClusterMarker[];
  className?: string;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const liveMarkerRef = useRef<any>(null);
  const spotMarkerRef = useRef<any>(null);
  const geofenceRef = useRef<any>(null);
  const clusterGroupRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    async function initMap() {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      if (!mapRef.current) return;
      const map = L.map(mapRef.current, { zoomControl: false }).setView([center.lat, center.lng], 15);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a>",
        maxZoom: 19,
      }).addTo(map);

      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        onPinDrop(lat, lng);
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          const icon = L.divIcon({
            className: "custom-pin",
            html: `<div style="position:relative;width:32px;height:32px;"><div style="position:absolute;width:32px;height:32px;background:#2563EB;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(37,99,235,0.4);"><div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:10px;height:10px;background:white;border-radius:50%;"></div></div></div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 28],
          });
          markerRef.current = L.marker([lat, lng], { icon }).addTo(map);
        }
      });

      if (spotPosition) {
        const spotIcon = L.divIcon({
          className: "custom-spot-pin",
          html: `<div style="position:relative;width:36px;height:36px;"><div style="position:absolute;width:36px;height:36px;background:#2563EB;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 4px 16px rgba(37,99,235,0.45);"><div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:12px;height:12px;background:white;border-radius:50%;"></div></div></div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 32],
        });
        spotMarkerRef.current = L.marker([spotPosition.lat, spotPosition.lng], { icon: spotIcon }).addTo(map);
      }

      if (geofence) {
        geofenceRef.current = L.circle([geofence.center.lat, geofence.center.lng], {
          radius: geofence.radiusMeters,
          color: geofence.color || "#7C3AED",
          fillColor: geofence.color || "#7C3AED",
          fillOpacity: 0.3,
          weight: 2,
          dashArray: "6 6",
        }).addTo(map);
      }

      mapInstanceRef.current = map;
    }

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      geofenceRef.current = null;
      clusterGroupRef.current = null;
    };
  }, [center.lat, center.lng, spotPosition?.lat, spotPosition?.lng, geofence?.center.lat, geofence?.center.lng, geofence?.radiusMeters]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    (async () => {
      const L = await import("leaflet");
      if (markerRef.current) {
        if (pinPosition) markerRef.current.setLatLng([pinPosition.lat, pinPosition.lng]);
      } else if (pinPosition) {
        const icon = L.divIcon({
          className: "custom-pin",
          html: `<div style="position:relative;width:32px;height:32px;"><div style="position:absolute;width:32px;height:32px;background:#2563EB;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(37,99,235,0.4);"><div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:10px;height:10px;background:white;border-radius:50%;"></div></div></div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 28],
        });
        markerRef.current = L.marker([pinPosition.lat, pinPosition.lng], { icon }).addTo(mapInstanceRef.current);
      }
    })();
  }, [pinPosition?.lat, pinPosition?.lng]);

  useEffect(() => {
    if (!mapInstanceRef.current || !livePosition) return;
    (async () => {
      const L = await import("leaflet");
      if (liveMarkerRef.current) {
        liveMarkerRef.current.setLatLng([livePosition.lat, livePosition.lng]);
      } else {
        const liveIcon = L.divIcon({
          className: "custom-live-pin",
          html: `<div style="width:24px;height:24px;background:#7C3AED;border:3px solid white;border-radius:50%;box-shadow:0 0 0 8px rgba(124,58,237,0.2),0 2px 8px rgba(124,58,237,0.4);animation:livePulse 2s infinite;"></div>
          <style>@keyframes livePulse{0%,100%{box-shadow:0 0 0 8px rgba(124,58,237,0.2),0 2px 8px rgba(124,58,237,0.4);}50%{box-shadow:0 0 0 16px rgba(124,58,237,0.1),0 2px 8px rgba(124,58,237,0.4);}}</style>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
        liveMarkerRef.current = L.marker([livePosition.lat, livePosition.lng], { icon: liveIcon }).addTo(mapInstanceRef.current);
      }
      mapInstanceRef.current.setView([livePosition.lat, livePosition.lng], mapInstanceRef.current.getZoom());
    })();
  }, [livePosition?.lat, livePosition?.lng]);

  // Cluster markers — separate effect so it doesn't interfere with the single-pin markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    let group: any = null;

    (async () => {
      const L = await import("leaflet");
      await import("leaflet.markercluster");
      await import("leaflet.markercluster/dist/MarkerCluster.css");
      await import("leaflet.markercluster/dist/MarkerCluster.Default.css");

      if (!mapInstanceRef.current) return;

      // Remove previous cluster group if any
      if (clusterGroupRef.current) {
        mapInstanceRef.current.removeLayer(clusterGroupRef.current);
        clusterGroupRef.current = null;
      }

      if (!clusterMarkers || clusterMarkers.length === 0) return;

      group = (L as any).markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
      });

      clusterMarkers.forEach((m) => {
        const icon = L.divIcon({
          className: "custom-cluster-marker",
          html: `<div style="width:20px;height:20px;background:${m.color || "#4285F4"};border:2px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });
        const marker = L.marker([m.lat, m.lng], { icon });
        if (m.tooltip) marker.bindTooltip(m.tooltip, { permanent: false, direction: "top" });
        group.addLayer(marker);
      });

      mapInstanceRef.current.addLayer(group);
      clusterGroupRef.current = group;
    })();

    return () => {
      if (group && mapInstanceRef.current) {
        try { mapInstanceRef.current.removeLayer(group); } catch {}
      }
    };
  }, [clusterMarkers]);

  return (
    <div ref={mapRef} className={`rounded-xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.12)] ${className}`} style={{ minHeight: 250 }} />
  );
}
