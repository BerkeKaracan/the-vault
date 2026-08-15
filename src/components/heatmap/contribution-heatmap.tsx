"use client";

import { useEffect, useMemo, useState } from "react";
import { getHeatmapTotals } from "@/app/(app)/materials-actions";
import { useI18n } from "@/i18n/provider";
import { t } from "@/i18n/t";
import { getLocalDateString } from "@/lib/local-date";
import type { WeekStart } from "@/lib/types";

const WEEKS = 26;
const DAYS = WEEKS * 7;

function weekStartWeeksAgo(weeks: number, weekStartsOn: WeekStart): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  const weekday = date.getDay();
  const offset = weekStartsOn === "sunday" ? weekday : (weekday + 6) % 7;
  date.setDate(date.getDate() - offset - (weeks - 1) * 7);
  return date;
}

function eachLocalDay(from: Date, count: number): string[] {
  const cursor = new Date(from);
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    out.push(getLocalDateString(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

function intensity(pages: number): number {
  if (pages <= 0) return 0;
  if (pages < 10) return 1;
  if (pages < 30) return 2;
  if (pages < 60) return 3;
  return 4;
}

const HEAT = ["heat-0", "heat-1", "heat-2", "heat-3", "heat-4"] as const;

function heatClass(pages: number): string {
  return HEAT[intensity(pages)] ?? "heat-0";
}

export function ContributionHeatmap({
  weekStartsOn = "monday",
  dailyGoal = null,
}: {
  weekStartsOn?: WeekStart;
  dailyGoal?: number | null;
}) {
  const { dictionary } = useI18n();
  const fromDate = useMemo(
    () => weekStartWeeksAgo(WEEKS, weekStartsOn),
    [weekStartsOn],
  );
  const from = useMemo(() => getLocalDateString(fromDate), [fromDate]);
  const days = useMemo(() => eachLocalDay(fromDate, DAYS), [fromDate]);
  const today = useMemo(() => getLocalDateString(), []);
  const [totals, setTotals] = useState<Record<string, number>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getHeatmapTotals(from).then((data) => {
      if (!cancelled) {
        setTotals(data);
        setLoaded(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [from]);

  const activeDays = Object.values(totals).filter((n) => n > 0).length;

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-mono text-[0.58rem] tracking-[0.22em] text-zinc-600 uppercase">
          {dictionary.desk.consistency}
        </p>
        <p className="font-mono text-[0.58rem] text-zinc-600">
          {t(dictionary.desk.heatmapStats, { days: activeDays })}
        </p>
      </div>
      <div
        className={`grid w-full grid-flow-col grid-rows-7 gap-0.75 ${loaded ? "" : "opacity-40"}`}
      >
        {days.map((date) => {
          const pages = totals[date] ?? 0;
          const isToday = date === today;
          const isFuture = date > today;
          const goalMet =
            dailyGoal != null && dailyGoal > 0 && pages >= dailyGoal;

          return (
            <span
              key={date}
              title={
                goalMet
                  ? t(dictionary.desk.heatmapCellGoal, {
                      date,
                      count: pages,
                      goal: dictionary.desk.goalMet,
                    })
                  : t(dictionary.desk.heatmapCell, { date, count: pages })
              }
              className={`relative aspect-square rounded-xs ${heatClass(pages)} ${isToday ? "ring-1 ring-accent/80" : ""} ${isFuture ? "opacity-30" : ""}`}
            >
              {goalMet ? (
                <span
                  aria-hidden
                  className="absolute -top-px -right-px size-1.5 rounded-full bg-white shadow-[0_0_6px_var(--accent)]"
                />
              ) : null}
            </span>
          );
        })}
      </div>
      <div className="mt-2 flex items-center justify-end gap-1.5 font-mono text-[0.58rem] text-zinc-600">
        <span>{dictionary.desk.heatmapLess}</span>
        <span className="heat-0 size-2.5 rounded-xs" />
        <span className="heat-1 size-2.5 rounded-xs" />
        <span className="heat-2 size-2.5 rounded-xs" />
        <span className="heat-3 size-2.5 rounded-xs" />
        <span className="heat-4 size-2.5 rounded-xs" />
        <span>{dictionary.desk.heatmapMore}</span>
      </div>
    </div>
  );
}
