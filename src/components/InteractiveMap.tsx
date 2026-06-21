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

export default function InteractiveMap({
  center,
  onPinDrop,
  pinPosition,
  livePosition,
  spotPosition,
  geofence,
  className = "",
}: {
  center: PinPosition;
  onPinDrop: (lat: number, lng: number) => void;
  pinPosition?: PinPosition | null;
  livePosition?: PinPosition | null;
  spotPosition?: PinPosition | null;
  geofence?: GeofenceCircle | null;
  className?: string;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const liveMarkerRef = useRef<any>(null);
  const spotMarkerRef = useRef<any>(null);
  const geofenceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    async function initMap() {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      if (!mapRef.current) return;
      const map = L.map(mapRef.current).setView([center.lat, center.lng], 15);

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
            html: `<svg width="32" height="32" viewBox="0 0 24 24" fill="#E94335" stroke="white" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3" fill="white"/></svg>`,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
          });
          markerRef.current = L.marker([lat, lng], { icon }).addTo(map);
        }
      });

      // Spot position marker (green pin for the parking spot)
      if (spotPosition) {
        const spotIcon = L.divIcon({
          className: "custom-spot-pin",
          html: `<svg width="36" height="36" viewBox="0 0 24 24" fill="#0F9D58" stroke="white" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3" fill="white"/></svg>`,
          iconSize: [36, 36],
          iconAnchor: [18, 36],
        });
        spotMarkerRef.current = L.marker([spotPosition.lat, spotPosition.lng], { icon: spotIcon }).addTo(map);
      }

      // Geofence circle
      if (geofence) {
        geofenceRef.current = L.circle([geofence.center.lat, geofence.center.lng], {
          radius: geofence.radiusMeters,
          color: geofence.color || "#4285F4",
          fillColor: geofence.color || "#4285F4",
          fillOpacity: 0.1,
          weight: 2,
          dashArray: "8 8",
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
    };
  }, [center.lat, center.lng, spotPosition?.lat, spotPosition?.lng, geofence?.center.lat, geofence?.center.lng, geofence?.radiusMeters]);

  // Pin position marker (user's selected spot - red)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    (async () => {
      const L = await import("leaflet");
      if (markerRef.current) {
        if (pinPosition) markerRef.current.setLatLng([pinPosition.lat, pinPosition.lng]);
      } else if (pinPosition) {
        const icon = L.divIcon({
          className: "custom-pin",
          html: `<svg width="32" height="32" viewBox="0 0 24 24" fill="#E94335" stroke="white" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3" fill="white"/></svg>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        });
        markerRef.current = L.marker([pinPosition.lat, pinPosition.lng], { icon }).addTo(mapInstanceRef.current);
      }
    })();
  }, [pinPosition?.lat, pinPosition?.lng]);

  // Live position marker (approaching user - blue)
  useEffect(() => {
    if (!mapInstanceRef.current || !livePosition) return;
    (async () => {
      const L = await import("leaflet");
      if (liveMarkerRef.current) {
        liveMarkerRef.current.setLatLng([livePosition.lat, livePosition.lng]);
      } else {
        const liveIcon = L.divIcon({
          className: "custom-live-pin",
          html: `<div style="width:20px;height:20px;background:#4285F4;border:3px solid white;border-radius:50%;box-shadow:0 0 8px rgba(66,133,244,0.6);animation:pulse 2s infinite;"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });
        liveMarkerRef.current = L.marker([livePosition.lat, livePosition.lng], { icon: liveIcon }).addTo(mapInstanceRef.current);
      }
      mapInstanceRef.current.setView([livePosition.lat, livePosition.lng], mapInstanceRef.current.getZoom());
    })();
  }, [livePosition?.lat, livePosition?.lng]);

  return (
    <div ref={mapRef} className={`rounded-xl ${className}`} style={{ minHeight: 250 }} />
  );
}
