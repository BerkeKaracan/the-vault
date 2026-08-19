import { describe, expect, it } from "vitest";
import {
  isGoalReminderSlot,
  slotForHour,
  zonedClock,
} from "@/lib/goal-reminders";

describe("isGoalReminderSlot", () => {
  it("accepts the two reminder windows", () => {
    expect(isGoalReminderSlot("12h")).toBe(true);
    expect(isGoalReminderSlot("3h")).toBe(true);
    expect(isGoalReminderSlot("1h")).toBe(false);
  });
});

describe("slotForHour", () => {
  it("maps noon and 21:00, otherwise null", () => {
    expect(slotForHour(12)).toBe("12h");
    expect(slotForHour(21)).toBe("3h");
    expect(slotForHour(13)).toBeNull();
  });
});

describe("zonedClock", () => {
  it("reads the calendar day and hour in the given zone", () => {
    const utcNoon = new Date("2026-08-17T12:00:00.000Z");
    expect(zonedClock("UTC", utcNoon)).toEqual({
      date: "2026-08-17",
      hour: 12,
    });
    expect(zonedClock("Europe/Istanbul", utcNoon)).toEqual({
      date: "2026-08-17",
      hour: 15,
    });
  });

  it("falls back to Istanbul for an unknown zone", () => {
    const lateUtc = new Date("2026-08-17T22:00:00.000Z");
    expect(zonedClock("Not/AZone", lateUtc).date).toBe("2026-08-18");
  });
});
