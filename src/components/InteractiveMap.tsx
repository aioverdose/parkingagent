"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

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

const TILE_STYLE = "https://tiles.openfreemap.org/styles/liberty";

function createPinElement(color = "#2563EB", size = 32, animate = false): HTMLDivElement {
  const outer = document.createElement("div");
  outer.style.cssText = `position:relative;width:${size}px;height:${size}px;`;
  const inner = document.createElement("div");
  inner.style.cssText = `position:absolute;width:${size}px;height:${size}px;background:${color};border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.3);`;
  if (animate) {
    inner.style.animation = "livePulse 2s infinite";
    inner.style.boxShadow = `0 0 0 8px ${color}33, 0 2px 8px rgba(0,0,0,0.3)`;
  }
  const dot = document.createElement("div");
  dot.style.cssText = "position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:10px;height:10px;background:white;border-radius:50%;";
  inner.appendChild(dot);
  outer.appendChild(inner);
  return outer;
}

function createDotElement(color = "#4285F4", size = 20): HTMLDivElement {
  const el = document.createElement("div");
  el.style.cssText = `width:${size}px;height:${size}px;background:${color};border:2px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.3);`;
  return el;
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
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const pinMarkerRef = useRef<maplibregl.Marker | null>(null);
  const liveMarkerRef = useRef<maplibregl.Marker | null>(null);
  const spotMarkerRef = useRef<maplibregl.Marker | null>(null);
  const geofenceSourceRef = useRef<string | null>(null);
  const clusterMarkersRef = useRef<maplibregl.Marker[]>([]);
  const onPinDropRef = useRef(onPinDrop);
  onPinDropRef.current = onPinDrop;
  const mapReadyRef = useRef(false);

  // Init map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = new maplibregl.Map({
      container: mapRef.current,
      style: TILE_STYLE,
      center: [center.lng, center.lat],
      zoom: 15,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

    map.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      onPinDropRef.current(lat, lng);
    });

    map.on("load", () => {
      mapReadyRef.current = true;

      // Add geofence source and layer
      map.addSource("geofence", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.addLayer({
        id: "geofence-fill",
        type: "fill",
        source: "geofence",
        paint: {
          "fill-color": "#7C3AED",
          "fill-opacity": 0.15,
        },
      });
      map.addLayer({
        id: "geofence-outline",
        type: "line",
        source: "geofence",
        paint: {
          "line-color": "#7C3AED",
          "line-width": 2,
          "line-dasharray": [4, 4],
        },
      });
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Pin marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReadyRef.current) return;

    if (pinMarkerRef.current) {
      pinMarkerRef.current.remove();
      pinMarkerRef.current = null;
    }
    if (pinPosition) {
      const el = createPinElement();
      pinMarkerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat([pinPosition.lng, pinPosition.lat])
        .addTo(map);
    }
  }, [pinPosition?.lat, pinPosition?.lng]);

  // Spot marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (spotMarkerRef.current) {
      spotMarkerRef.current.remove();
      spotMarkerRef.current = null;
    }
    if (spotPosition) {
      const el = createPinElement("#2563EB", 36);
      spotMarkerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat([spotPosition.lng, spotPosition.lat])
        .addTo(map);
    }
  }, [spotPosition?.lat, spotPosition?.lng]);

  // Live position marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (liveMarkerRef.current) {
      if (livePosition) {
        liveMarkerRef.current.setLngLat([livePosition.lng, livePosition.lat]);
        map.flyTo({ center: [livePosition.lng, livePosition.lat], duration: 800 });
      } else {
        liveMarkerRef.current.remove();
        liveMarkerRef.current = null;
      }
      return;
    }
    if (livePosition) {
      const el = createPinElement("#7C3AED", 24, true);
      liveMarkerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat([livePosition.lng, livePosition.lat])
        .addTo(map);
      map.flyTo({ center: [livePosition.lng, livePosition.lat], duration: 800 });
    }
  }, [livePosition?.lat, livePosition?.lng]);

  // Geofence
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !map.getSource("geofence")) return;

    if (geofence) {
      const radiusDeg = geofence.radiusMeters / 111320;
      const steps = 64;
      const coords: Array<[number, number]> = [];
      for (let i = 0; i <= steps; i++) {
        const angle = (i / steps) * 2 * Math.PI;
        const dx = radiusDeg * Math.cos(angle);
        const dy = radiusDeg * Math.sin(angle);
        coords.push([geofence.center.lng + dx / Math.cos((geofence.center.lat * Math.PI) / 180), geofence.center.lat + dy]);
      }
      (map.getSource("geofence") as maplibregl.GeoJSONSource).setData({
        type: "Feature",
        geometry: { type: "Polygon", coordinates: [coords] },
        properties: {},
      });
    } else {
      (map.getSource("geofence") as maplibregl.GeoJSONSource).setData({
        type: "FeatureCollection",
        features: [],
      });
    }
  }, [geofence?.center.lat, geofence?.center.lng, geofence?.radiusMeters]);

  // Cluster markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    clusterMarkersRef.current.forEach((m) => m.remove());
    clusterMarkersRef.current = [];

    if (!clusterMarkers || clusterMarkers.length === 0) return;

    clusterMarkers.forEach((m) => {
      const el = createDotElement(m.color);
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([m.lng, m.lat])
        .addTo(map);
      if (m.tooltip) {
        const popup = new maplibregl.Popup({ offset: 10, closeButton: false })
          .setText(m.tooltip);
        marker.setPopup(popup);
      }
      clusterMarkersRef.current.push(marker);
    });
  }, [clusterMarkers]);

  return (
    <div
      ref={mapRef}
      className={`rounded-xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.12)] ${className}`}
      style={{ minHeight: 250 }}
    />
  );
}
