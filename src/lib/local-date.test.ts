import { describe, expect, it } from "vitest";
import {
  addDaysToDateString,
  calendarPartsInTimeZone,
  dateStringInTimeZone,
  normalizeLoggedOn,
  startOfWeekDateString,
} from "@/lib/local-date";

describe("normalizeLoggedOn", () => {
  it("keeps a date-only key", () => {
    expect(normalizeLoggedOn("2026-08-17")).toBe("2026-08-17");
  });

  it("strips ISO time and offset", () => {
    expect(normalizeLoggedOn("2026-08-17T00:00:00.000Z")).toBe("2026-08-17");
    expect(normalizeLoggedOn("2026-08-17 00:00:00+03")).toBe("2026-08-17");
  });

  it("rejects empty and malformed values", () => {
    expect(normalizeLoggedOn(null)).toBeNull();
    expect(normalizeLoggedOn("17/08/2026")).toBeNull();
  });
});

describe("dateStringInTimeZone", () => {
  it("uses the zone calendar day, not UTC", () => {
    const lateUtc = new Date("2026-08-17T22:00:00.000Z");
    expect(dateStringInTimeZone(lateUtc, "UTC")).toBe("2026-08-17");
    expect(dateStringInTimeZone(lateUtc, "Europe/Istanbul")).toBe("2026-08-18");
  });

  it("falls back to Europe/Istanbul for unknown zones", () => {
    const lateUtc = new Date("2026-08-17T22:00:00.000Z");
    expect(dateStringInTimeZone(lateUtc, "Not/AZone")).toBe("2026-08-18");
  });
});

describe("calendar helpers", () => {
  it("splits year month day in zone", () => {
    const parts = calendarPartsInTimeZone(
      new Date("2026-01-01T00:30:00.000Z"),
      "Europe/Istanbul",
    );
    expect(parts).toEqual({
      year: 2026,
      month: 1,
      day: 1,
      date: "2026-01-01",
    });
  });

  it("adds days on the civil calendar", () => {
    expect(addDaysToDateString("2026-08-17", -1)).toBe("2026-08-16");
    expect(addDaysToDateString("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("starts the week on monday or sunday", () => {
    expect(startOfWeekDateString("2026-08-17", "monday")).toBe("2026-08-17");
    expect(startOfWeekDateString("2026-08-17", "sunday")).toBe("2026-08-16");
  });
});
