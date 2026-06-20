import { describe, it, expect } from "vitest";
import { haversineDistanceKm, haversineDistanceMiles } from "@/lib/geo";

describe("haversineDistanceKm", () => {
  it("returns 0 for the same point", () => {
    expect(haversineDistanceKm(33.77, -118.19, 33.77, -118.19)).toBe(0);
  });

  it("returns ~1.1km for 0.01 degree lat difference", () => {
    const dist = haversineDistanceKm(33.77, -118.19, 33.78, -118.19);
    expect(dist).toBeGreaterThan(1.1);
    expect(dist).toBeLessThan(1.2);
  });

  it("is commutative", () => {
    const d1 = haversineDistanceKm(33.77, -118.19, 33.78, -118.2);
    const d2 = haversineDistanceKm(33.78, -118.2, 33.77, -118.19);
    expect(Math.abs(d1 - d2)).toBeLessThan(0.001);
  });
});

describe("haversineDistanceMiles", () => {
  it("returns 0 for the same point", () => {
    expect(haversineDistanceMiles(33.77, -118.19, 33.77, -118.19)).toBe(0);
  });

  it("returns miles which are less than km for same points", () => {
    const km = haversineDistanceKm(33.77, -118.19, 33.78, -118.19);
    const mi = haversineDistanceMiles(33.77, -118.19, 33.78, -118.19);
    expect(mi).toBeLessThan(km);
  });

  it("is commutative", () => {
    const d1 = haversineDistanceMiles(33.77, -118.19, 33.78, -118.2);
    const d2 = haversineDistanceMiles(33.78, -118.2, 33.77, -118.19);
    expect(Math.abs(d1 - d2)).toBeLessThan(0.001);
  });
});
