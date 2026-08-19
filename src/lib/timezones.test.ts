import { describe, expect, it } from "vitest";
import { DEFAULT_TIMEZONE, isTimezone, resolveTimezone } from "@/lib/timezones";

describe("resolveTimezone", () => {
  it("keeps a known zone and falls back to Istanbul", () => {
    expect(resolveTimezone("UTC")).toBe("UTC");
    expect(resolveTimezone("Europe/Istanbul")).toBe("Europe/Istanbul");
    expect(resolveTimezone("Not/AZone")).toBe(DEFAULT_TIMEZONE);
    expect(resolveTimezone(null)).toBe(DEFAULT_TIMEZONE);
    expect(isTimezone("Asia/Tokyo")).toBe(true);
    expect(isTimezone("Asia/Nowhere")).toBe(false);
  });
});
