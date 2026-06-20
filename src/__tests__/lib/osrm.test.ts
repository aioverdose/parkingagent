import { describe, it, expect } from "vitest";
import { computeTimeFitScore, ETA_TOLERANCE_MINUTES } from "@/lib/services/osrm";

describe("computeTimeFitScore", () => {
  it("returns 1 for exact match", () => {
    const score = computeTimeFitScore(30, 30);
    expect(score).toBe(1);
  });

  it("returns < 1 but > 0 for within tolerance", () => {
    const score = computeTimeFitScore(30, 35);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(1);
  });

  it("returns 0 for outside tolerance", () => {
    const score = computeTimeFitScore(30, 60);
    expect(score).toBe(0);
  });

  it("returns 0 for far outside tolerance", () => {
    const score = computeTimeFitScore(30, 120);
    expect(score).toBe(0);
  });

  it("decays linearly past zero diff", () => {
    const exact = computeTimeFitScore(30, 30);
    const close = computeTimeFitScore(30, 33);
    expect(close).toBeLessThan(exact);
  });

  it("handles zero eta", () => {
    const score = computeTimeFitScore(0, 0);
    expect(score).toBe(1);
  });

  it("is symmetric", () => {
    const a = computeTimeFitScore(30, 40);
    const b = computeTimeFitScore(40, 30);
    expect(a).toBe(b);
  });

  it("respects custom tolerance", () => {
    const score = computeTimeFitScore(30, 40, 20);
    expect(score).toBe(1 - 10 / 40);
  });
});
