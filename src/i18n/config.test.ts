import { describe, expect, it } from "vitest";
import { isCookieConsent, isLocale } from "@/i18n/config";

describe("isLocale", () => {
  it("accepts tr and en", () => {
    expect(isLocale("tr")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("de")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
});

describe("isCookieConsent", () => {
  it("accepts necessary and all", () => {
    expect(isCookieConsent("necessary")).toBe(true);
    expect(isCookieConsent("all")).toBe(true);
    expect(isCookieConsent("marketing")).toBe(false);
    expect(isCookieConsent(null)).toBe(false);
  });
});
