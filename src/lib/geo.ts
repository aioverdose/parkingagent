import pointDistance from "@turf/distance";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { point, polygon } from "@turf/helpers";
import bbox from "@turf/bbox";
import type { Feature, Point, Polygon } from "geojson";

const R_KM = 6371;
const R_MILES = 3959;
const KM_TO_MILES = 0.621371;

export function haversineDistanceKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const from = point([lng1, lat1]);
  const to = point([lng2, lat2]);
  return pointDistance(from, to, { units: "kilometers" });
}

export function haversineDistanceMiles(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  return haversineDistanceKm(lat1, lng1, lat2, lng2) * KM_TO_MILES;
}

export function isInsideGeofence(
  lat: number, lng: number,
  centerLat: number, centerLng: number,
  radiusMeters: number,
): boolean {
  const distKm = haversineDistanceKm(lat, lng, centerLat, centerLng);
  return distKm * 1000 <= radiusMeters;
}

export function isPointInPolygon(
  lat: number, lng: number,
  coords: number[][],
): boolean {
  const pt = point([lng, lat]);
  const poly = polygon([[...coords, coords[0]]]);
  return booleanPointInPolygon(pt, poly);
}

export function getBoundingBox(
  lats: number[], lngs: number[],
): { minLat: number; maxLat: number; minLng: number; maxLng: number } {
  return {
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLng: Math.min(...lngs),
    maxLng: Math.max(...lngs),
  };
}

export function getCenter(
  lats: number[], lngs: number[],
): { lat: number; lng: number } {
  const n = lats.length;
  if (!n) return { lat: 0, lng: 0 };
  const avgLat = lats.reduce((a, b) => a + b, 0) / n;
  const avgLng = lngs.reduce((a, b) => a + b, 0) / n;
  return { lat: avgLat, lng: avgLng };
}

export function metersToMiles(m: number): number {
  return m * 0.000621371;
}

export function milesToMeters(mi: number): number {
  return mi * 1609.34;
}

export { R_KM, R_MILES };
