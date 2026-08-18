import { addDaysToDateString, normalizeLoggedOn } from "@/lib/local-date";

export function uniqueSortedDates(values: string[]): string[] {
  const days = new Set<string>();
  for (const value of values) {
    const day = normalizeLoggedOn(value);
    if (day) days.add(day);
  }
  return [...days].sort();
}

export function longestStreak(dates: string[]): number {
  const unique = uniqueSortedDates(dates);
  if (unique.length === 0) return 0;
  let best = 1;
  let run = 1;
  for (let i = 1; i < unique.length; i++) {
    if (unique[i] === addDaysToDateString(unique[i - 1], 1)) {
      run += 1;
      if (run > best) best = run;
    } else {
      run = 1;
    }
  }
  return best;
}

/** Dates that had real progress — corrections stay out of stats/streaks. */
export function positiveLoggedDates(
  rows: { logged_on: string; pages_delta: number }[],
): string[] {
  return uniqueSortedDates(
    rows.filter((row) => row.pages_delta > 0).map((row) => row.logged_on),
  );
}

/** Consecutive days ending today, or yesterday if today is still empty. */
export function currentStreak(dates: string[], today: string): number {
  const set = new Set(uniqueSortedDates(dates));
  let cursor = set.has(today) ? today : addDaysToDateString(today, -1);
  if (!set.has(cursor)) return 0;
  let run = 0;
  while (set.has(cursor)) {
    run += 1;
    cursor = addDaysToDateString(cursor, -1);
  }
  return run;
}
