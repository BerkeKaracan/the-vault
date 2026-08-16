import { cache } from "react";
import { getAuthUser } from "@/lib/auth";
import { getLocalDateString } from "@/lib/local-date";
import { createClient } from "@/lib/supabase/server";

export type StatsSummary = {
  monthDays: number;
  yearDays: number;
  monthPages: number;
  yearPages: number;
  completed: number;
  streak: number;
};

const EMPTY: StatsSummary = {
  monthDays: 0,
  yearDays: 0,
  monthPages: 0,
  yearPages: 0,
  completed: 0,
  streak: 0,
};

function longestStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const unique = [...new Set(dates)].sort();
  let best = 1;
  let run = 1;
  for (let i = 1; i < unique.length; i++) {
    const prev = new Date(`${unique[i - 1]}T00:00:00`);
    const cur = new Date(`${unique[i]}T00:00:00`);
    const diff = (cur.getTime() - prev.getTime()) / 86400000;
    if (diff === 1) {
      run += 1;
      if (run > best) best = run;
    } else if (diff > 1) {
      run = 1;
    }
  }
  return best;
}

export const getStatsSummary = cache(async (): Promise<StatsSummary> => {
  try {
    const [supabase, user] = await Promise.all([createClient(), getAuthUser()]);
    if (!user) return EMPTY;

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const yearStart = `${year}-01-01`;
    const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;
    const todayIso = getLocalDateString(today);

    const [
      { data: rows, error },
      { count, error: countError },
      { data: streakRows, error: streakError },
    ] = await Promise.all([
      supabase
        .from("progress_entries")
        .select("logged_on, pages_delta, materials(metric_type)")
        .eq("user_id", user.id)
        .gte("logged_on", yearStart)
        .lte("logged_on", todayIso),
      supabase
        .from("materials")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "completed"),
      supabase
        .from("progress_entries")
        .select("logged_on")
        .eq("user_id", user.id),
    ]);

    if (error) {
      console.error("[getStatsSummary]", error.message);
      return EMPTY;
    }
    if (countError) {
      console.error("[getStatsSummary completed]", countError.message);
    }
    if (streakError) {
      console.error("[getStatsSummary streak]", streakError.message);
    }

    const monthDays = new Set<string>();
    const yearDays = new Set<string>();
    let monthPages = 0;
    let yearPages = 0;

    for (const row of rows ?? []) {
      yearDays.add(row.logged_on);
      const metric = Array.isArray(row.materials)
        ? row.materials[0]?.metric_type
        : row.materials?.metric_type;
      const isPages = metric !== "questions" && metric !== "chapters";
      if (isPages) yearPages += row.pages_delta;
      if (row.logged_on >= monthStart) {
        monthDays.add(row.logged_on);
        if (isPages) monthPages += row.pages_delta;
      }
    }

    return {
      monthDays: monthDays.size,
      yearDays: yearDays.size,
      monthPages,
      yearPages,
      completed: count ?? 0,
      streak: longestStreak((streakRows ?? []).map((row) => row.logged_on)),
    };
  } catch (error) {
    console.error("[getStatsSummary]", error);
    return EMPTY;
  }
});
