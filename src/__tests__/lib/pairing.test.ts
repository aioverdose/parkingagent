import { describe, it, expect } from "vitest";
import { haversineDistanceKm } from "@/lib/geo";
import { scoreOffers } from "@/lib/services/pairing";

describe("haversineDistanceKm", () => {
  it("returns 0 for the same point", () => {
    expect(haversineDistanceKm(33.77, -118.19, 33.77, -118.19)).toBe(0);
  });

  it("returns ~0.5km for 0.005 degree lat difference", () => {
    const dist = haversineDistanceKm(33.77, -118.19, 33.775, -118.19);
    expect(dist).toBeGreaterThan(0.5);
    expect(dist).toBeLessThan(0.6);
  });

  it("returns ~1km for 0.01 degree lat difference", () => {
    const dist = haversineDistanceKm(33.77, -118.19, 33.78, -118.19);
    expect(dist).toBeGreaterThan(1.1);
    expect(dist).toBeLessThan(1.2);
  });

  it("is commutative (distance A->B === B->A)", () => {
    const d1 = haversineDistanceKm(33.77, -118.19, 33.78, -118.2);
    const d2 = haversineDistanceKm(33.78, -118.2, 33.77, -118.19);
    expect(Math.abs(d1 - d2)).toBeLessThan(0.001);
  });

  it("handles negative coordinates", () => {
    const dist = haversineDistanceKm(-33.86, 151.2, -33.87, 151.21);
    expect(dist).toBeGreaterThan(0);
  });
});

describe("scoreOffers", () => {
  const baseOffers = [
    { id: "1", userId: "u1", latitude: 33.77, longitude: -118.19, address: "Spot A", status: "available", createdAt: new Date().toISOString(), expectedDeparture: null, vehicleType: null, vehicleSize: null },
    { id: "2", userId: "u2", latitude: 33.78, longitude: -118.2, address: "Spot B", status: "available", createdAt: new Date().toISOString(), expectedDeparture: null, vehicleType: null, vehicleSize: null },
  ];

  it("returns sorted offers by composite score", () => {
    const rankings = new Map([["u1", 5], ["u2", 1]]);
    const result = scoreOffers(baseOffers, 33.77, -118.19, rankings);
    expect(result).toHaveLength(2);
    expect(result[0].compositeScore).toBeLessThanOrEqual(result[1].compositeScore);
  });

  it("assigns higher ranking score to users in the map", () => {
    const rankings = new Map([["u1", 5], ["u2", 1]]);
    const result = scoreOffers(baseOffers, 33.77, -118.19, rankings);
    expect(result.find((o) => o.userId === "u1")?.rankingScore).toBe(5);
    expect(result.find((o) => o.userId === "u2")?.rankingScore).toBe(1);
  });

  it("returns empty array for empty offers", () => {
    const result = scoreOffers([], 33.77, -118.19, new Map());
    expect(result).toEqual([]);
  });

  it("handles single offer", () => {
    const rankings = new Map([["u1", 3]]);
    const result = scoreOffers([baseOffers[0]], 33.77, -118.19, rankings);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });
});
