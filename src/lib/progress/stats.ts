import { unstable_rethrow } from "next/navigation";
import { cache } from "react";
import { requireUser } from "@/lib/auth";
import { isMetricType } from "@/lib/catalog/fields";
import {
  addDaysToDateString,
  calendarPartsInTimeZone,
  normalizeLoggedOn,
  startOfWeekDateString,
} from "@/lib/local-date";
import { getSessionProfile } from "@/lib/profile";
import {
  currentStreak,
  longestStreak,
  positiveLoggedDates,
} from "@/lib/progress/streak";
import { createClient } from "@/lib/supabase/server";
import { resolveTimezone } from "@/lib/timezones";
import type { MetricType, WeekStart } from "@/lib/types";

export const WEEK_CHART_WEEKS = 12;

export type WeeklyPages = {
  weekStart: string;
  pages: number;
};

export type StatsSummary = {
  monthDays: number;
  yearDays: number;
  weekDays: number;
  monthPages: number;
  yearPages: number;
  weekPages: number;
  monthQuestions: number;
  yearQuestions: number;
  monthChapters: number;
  yearChapters: number;
  completed: number;
  currentStreak: number;
  longestStreak: number;
  weeks: WeeklyPages[];
};

export type StatsResult = { ok: true; data: StatsSummary } | { ok: false };

type NestedMaterial = { metric_type: string | null };

type StatsRow = {
  logged_on: string;
  pages_delta: number;
  material_id: string;
  materials?: NestedMaterial | NestedMaterial[] | null;
};

function metricOf(row: StatsRow, extras: Map<string, MetricType>): MetricType {
  const nested = Array.isArray(row.materials)
    ? row.materials[0]
    : row.materials;
  if (nested?.metric_type && isMetricType(nested.metric_type)) {
    return nested.metric_type;
  }
  return extras.get(row.material_id) ?? "pages";
}

function lastWeekStarts(
  today: string,
  count: number,
  weekStartsOn: WeekStart,
): string[] {
  const thisWeek = startOfWeekDateString(today, weekStartsOn);
  return Array.from({ length: count }, (_, index) =>
    addDaysToDateString(thisWeek, -7 * (count - 1 - index)),
  );
}

export const getStatsSummary = cache(async (): Promise<StatsResult> => {
  try {
    const [supabase, user, session] = await Promise.all([
      createClient(),
      requireUser(),
      getSessionProfile(),
    ]);

    const timeZone = resolveTimezone(session.profile?.timezone);
    const weekStartsOn = session.profile?.week_starts_on ?? "monday";
    const todayParts = calendarPartsInTimeZone(new Date(), timeZone);
    const today = todayParts.date;
    const yearStart = `${todayParts.year}-01-01`;
    const monthStart = `${todayParts.year}-${String(todayParts.month).padStart(2, "0")}-01`;
    const weekStart = startOfWeekDateString(today, weekStartsOn);
    const weekKeys = lastWeekStarts(today, WEEK_CHART_WEEKS, weekStartsOn);
    const chartStart = weekKeys[0] ?? weekStart;
    const lookback = chartStart < yearStart ? chartStart : yearStart;

    const withJoin = await supabase
      .from("progress_entries")
      .select("logged_on, pages_delta, material_id, materials(metric_type)")
      .eq("user_id", user.id)
      .gte("logged_on", lookback)
      .lte("logged_on", today);

    let rows: StatsRow[] = withJoin.data ?? [];
    const extras = new Map<string, MetricType>();

    if (withJoin.error) {
      console.error("[getStatsSummary] embed", withJoin.error.message);
      const plain = await supabase
        .from("progress_entries")
        .select("logged_on, pages_delta, material_id")
        .eq("user_id", user.id)
        .gte("logged_on", lookback)
        .lte("logged_on", today);

      if (plain.error) {
        console.error("[getStatsSummary]", plain.error.message);
        return { ok: false };
      }

      rows = plain.data ?? [];
      const ids = [...new Set(rows.map((row) => row.material_id))];
      if (ids.length > 0) {
        const { data: materials } = await supabase
          .from("materials")
          .select("id, metric_type")
          .in("id", ids);
        for (const material of materials ?? []) {
          extras.set(
            material.id,
            isMetricType(material.metric_type) ? material.metric_type : "pages",
          );
        }
      }
    }

    const [
      { count, error: countError },
      { data: streakRows, error: streakError },
    ] = await Promise.all([
      supabase
        .from("materials")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "completed"),
      supabase
        .from("progress_entries")
        .select("logged_on, pages_delta")
        .eq("user_id", user.id),
    ]);

    if (countError) {
      console.error("[getStatsSummary completed]", countError.message);
      return { ok: false };
    }
    if (streakError) {
      console.error("[getStatsSummary streak]", streakError.message);
      return { ok: false };
    }

    const monthDays = new Set<string>();
    const yearDays = new Set<string>();
    const weekDays = new Set<string>();
    let monthPages = 0;
    let yearPages = 0;
    let weekPages = 0;
    let monthQuestions = 0;
    let yearQuestions = 0;
    let monthChapters = 0;
    let yearChapters = 0;
    const weekTotals = new Map(weekKeys.map((key) => [key, 0]));

    for (const row of rows) {
      const date = normalizeLoggedOn(row.logged_on);
      if (!date || row.pages_delta <= 0) continue;
      const metric = metricOf(row, extras);
      const inYear = date >= yearStart;
      const inMonth = date >= monthStart;
      const inWeek = date >= weekStart;

      if (inYear) yearDays.add(date);
      if (inMonth) monthDays.add(date);
      if (inWeek) weekDays.add(date);

      if (metric === "pages") {
        if (inYear) yearPages += row.pages_delta;
        if (inMonth) monthPages += row.pages_delta;
        if (inWeek) weekPages += row.pages_delta;
        const bucket = startOfWeekDateString(date, weekStartsOn);
        if (weekTotals.has(bucket)) {
          weekTotals.set(
            bucket,
            (weekTotals.get(bucket) ?? 0) + row.pages_delta,
          );
        }
      } else if (metric === "questions") {
        if (inYear) yearQuestions += row.pages_delta;
        if (inMonth) monthQuestions += row.pages_delta;
      } else if (metric === "chapters") {
        if (inYear) yearChapters += row.pages_delta;
        if (inMonth) monthChapters += row.pages_delta;
      }
    }

    const streakDates = positiveLoggedDates(streakRows ?? []);

    return {
      ok: true,
      data: {
        monthDays: monthDays.size,
        yearDays: yearDays.size,
        weekDays: weekDays.size,
        monthPages,
        yearPages,
        weekPages,
        monthQuestions,
        yearQuestions,
        monthChapters,
        yearChapters,
        completed: count ?? 0,
        currentStreak: currentStreak(streakDates, today),
        longestStreak: longestStreak(streakDates),
        weeks: weekKeys.map((start) => ({
          weekStart: start,
          pages: Math.max(0, weekTotals.get(start) ?? 0),
        })),
      },
    };
  } catch (error) {
    unstable_rethrow(error);
    console.error("[getStatsSummary]", error);
    return { ok: false };
  }
});
