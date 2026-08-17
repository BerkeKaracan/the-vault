import { isTimezone } from "@/lib/timezones";

export const GOAL_REMINDER_HOURS = {
  "12h": 12,
  "3h": 21,
} as const;

export type GoalReminderSlot = keyof typeof GOAL_REMINDER_HOURS;

export function isGoalReminderSlot(value: string): value is GoalReminderSlot {
  return value === "12h" || value === "3h";
}

export function zonedClock(
  timeZone: string,
  date = new Date(),
): { date: string; hour: number } {
  const zone = isTimezone(timeZone) ? timeZone : "Europe/Istanbul";
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const read = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "0";

  return {
    date: `${read("year")}-${read("month")}-${read("day")}`,
    hour: Number(read("hour")),
  };
}

export function slotForHour(hour: number): GoalReminderSlot | null {
  if (hour === GOAL_REMINDER_HOURS["12h"]) return "12h";
  if (hour === GOAL_REMINDER_HOURS["3h"]) return "3h";
  return null;
}
