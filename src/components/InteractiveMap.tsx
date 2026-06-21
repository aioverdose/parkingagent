"use client";

import { useEffect, useRef } from "react";

export interface PinPosition {
  lat: number;
  lng: number;
}

export default function InteractiveMap({
  center,
  onPinDrop,
  pinPosition,
  className = "",
}: {
  center: PinPosition;
  onPinDrop: (lat: number, lng: number) => void;
  pinPosition?: PinPosition | null;
  className?: string;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

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

      mapInstanceRef.current = map;
    }

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center.lat, center.lng]);

  useEffect(() => {
    if (!mapInstanceRef.current || !pinPosition) return;
    (async () => {
      const L = await import("leaflet");
      if (markerRef.current) {
        markerRef.current.setLatLng([pinPosition.lat, pinPosition.lng]);
      } else {
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

  return (
    <div ref={mapRef} className={`rounded-xl ${className}`} style={{ minHeight: 250 }} />
  );
}
