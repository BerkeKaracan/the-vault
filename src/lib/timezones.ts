export const DEFAULT_TIMEZONE = "Europe/Istanbul";

export const TIMEZONES = [
  "UTC",
  "Europe/Istanbul",
  "Europe/Athens",
  "Europe/Berlin",
  "Europe/London",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Asia/Dubai",
  "Asia/Tokyo",
  "Australia/Sydney",
] as const;

type Timezone = (typeof TIMEZONES)[number];

export function isTimezone(value: string): value is Timezone {
  return (TIMEZONES as readonly string[]).includes(value);
}

export function resolveTimezone(value: string | null | undefined): string {
  return value && isTimezone(value) ? value : DEFAULT_TIMEZONE;
}
