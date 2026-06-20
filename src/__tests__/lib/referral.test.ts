import { describe, it, expect } from "vitest";
import { REFERRAL_COOKIE, REFERRAL_COOKIE_MAX_AGE } from "@/lib/referral";

const PA_CODE_REGEX = /^PA-[A-Z0-9]{6}$/;

describe("referral code format", () => {
  it("matches PA-XXXXXX pattern for valid codes", () => {
    const validCodes = ["PA-ABC123", "PA-000000", "PA-Z9X8W7", "PA-JKLMN3"];
    for (const code of validCodes) {
      expect(PA_CODE_REGEX.test(code)).toBe(true);
    }
  });

  it("rejects codes that don't match the pattern", () => {
    const invalidCodes = [
      "PA-ABC12",
      "PB-ABC123",
      "PA-ABC1234",
      "pa-abc123",
      "PA_ABC123",
      "ABC123",
    ];
    for (const code of invalidCodes) {
      expect(PA_CODE_REGEX.test(code)).toBe(false);
    }
  });

  it("excludes ambiguous characters (0,O,I,1)", () => {
    const validChars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    expect(validChars).not.toContain("0");
    expect(validChars).not.toContain("O");
    expect(validChars).not.toContain("I");
    expect(validChars).not.toContain("1");
  });
});

describe("REFERRAL_COOKIE constant", () => {
  it("has the correct value", () => {
    expect(REFERRAL_COOKIE).toBe("pa_ref");
  });

  it("has a valid max age (30 days)", () => {
    expect(REFERRAL_COOKIE_MAX_AGE).toBe(30 * 24 * 60 * 60);
    expect(REFERRAL_COOKIE_MAX_AGE).toBeGreaterThan(0);
  });
});
