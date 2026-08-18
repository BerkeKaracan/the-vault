import { resolveTimezone } from "@/lib/timezones";
import type { WeekStart } from "@/lib/types";

const ISO_DAY = /^(\d{4}-\d{2}-\d{2})/;

/** Client-local calendar day as YYYY-MM-DD (never derive from UTC server time). */
export function getLocalDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Date-only key from DATE or timestamptz (`2026-08-17T00:00:00.000Z` → `2026-08-17`). */
export function normalizeLoggedOn(
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  const match = ISO_DAY.exec(value.trim());
  return match?.[1] ?? null;
}

export function dateStringInTimeZone(date: Date, timeZone: string): string {
  const zone = resolveTimezone(timeZone);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  if (!year || !month || !day) {
    throw new Error("Could not format calendar day");
  }
  return `${year}-${month}-${day}`;
}

export function calendarPartsInTimeZone(
  date: Date,
  timeZone: string,
): { year: number; month: number; day: number; date: string } {
  const iso = dateStringInTimeZone(date, timeZone);
  const [year, month, day] = iso.split("-").map(Number);
  return { year, month, day, date: iso };
}

export function addDaysToDateString(iso: string, days: number): string {
  const [year, month, day] = iso.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day + days));
  return `${utc.getUTCFullYear()}-${String(utc.getUTCMonth() + 1).padStart(2, "0")}-${String(utc.getUTCDate()).padStart(2, "0")}`;
}

export function startOfWeekDateString(
  iso: string,
  weekStartsOn: WeekStart,
): string {
  const [year, month, day] = iso.split("-").map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  const offset = weekStartsOn === "sunday" ? weekday : (weekday + 6) % 7;
  return addDaysToDateString(iso, -offset);
}
