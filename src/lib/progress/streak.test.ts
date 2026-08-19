import { describe, expect, it } from "vitest";
import {
  currentStreak,
  longestStreak,
  positiveLoggedDates,
  uniqueSortedDates,
} from "@/lib/progress/streak";

describe("longestStreak", () => {
  it("counts consecutive calendar days and ignores duplicates", () => {
    expect(
      longestStreak([
        "2026-08-17T00:00:00.000Z",
        "2026-08-16",
        "2026-08-15",
        "2026-08-15",
        "2026-08-10",
      ]),
    ).toBe(3);
  });

  it("returns 0 when empty", () => {
    expect(longestStreak([])).toBe(0);
  });

  it("resets after a gap", () => {
    expect(longestStreak(["2026-08-10", "2026-08-11", "2026-08-13"])).toBe(2);
  });
});

describe("uniqueSortedDates", () => {
  it("normalizes, dedupes, and sorts", () => {
    expect(
      uniqueSortedDates([
        "2026-08-17T12:00:00.000Z",
        "2026-08-16",
        "2026-08-17",
        "nope",
      ]),
    ).toEqual(["2026-08-16", "2026-08-17"]);
  });
});

describe("currentStreak", () => {
  it("counts a run that includes today", () => {
    expect(
      currentStreak(["2026-08-15", "2026-08-16", "2026-08-17"], "2026-08-17"),
    ).toBe(3);
  });

  it("allows a run that ended yesterday", () => {
    expect(currentStreak(["2026-08-15", "2026-08-16"], "2026-08-17")).toBe(2);
  });

  it("is zero when the last day is older than yesterday", () => {
    expect(currentStreak(["2026-08-14"], "2026-08-17")).toBe(0);
  });
});

describe("positiveLoggedDates", () => {
  it("keeps a day that had progress even if a correction exists", () => {
    expect(
      positiveLoggedDates([
        { logged_on: "2026-08-17", pages_delta: 12 },
        { logged_on: "2026-08-17", pages_delta: -3 },
        { logged_on: "2026-08-16", pages_delta: -5 },
      ]),
    ).toEqual(["2026-08-17"]);
  });

  it("ignores zero and negative-only days", () => {
    expect(
      positiveLoggedDates([
        { logged_on: "2026-08-17", pages_delta: 0 },
        { logged_on: "2026-08-16", pages_delta: -8 },
      ]),
    ).toEqual([]);
  });
});
