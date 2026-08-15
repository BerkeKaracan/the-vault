"use client";

import { useEffect, useMemo, useState } from "react";
import { getHeatmapTotals } from "@/app/(app)/materials-actions";
import { useI18n } from "@/i18n/provider";
import { t } from "@/i18n/t";
import { getLocalDateString } from "@/lib/local-date";
import type { WeekStart } from "@/lib/types";

const WEEKS = 26;
const DAYS = WEEKS * 7;

const LEVELS = [
  "bg-white/[0.04]",
  "bg-emerald-950",
  "bg-emerald-800",
  "bg-emerald-600",
  "bg-emerald-400",
] as const;

function weekStartWeeksAgo(weeks: number, weekStartsOn: WeekStart): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  const weekday = date.getDay();
  const offset =
    weekStartsOn === "sunday" ? weekday : (weekday + 6) % 7;
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

export function ContributionHeatmap({
  weekStartsOn = "monday",
}: {
  weekStartsOn?: WeekStart;
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
    <div className="rounded-xl border border-white/8 bg-zinc-950/50 p-4 sm:p-5">
      <div
        className={`grid w-full grid-flow-col grid-rows-7 gap-0.75 ${loaded ? "" : "opacity-40"}`}
      >
        {days.map((date) => {
          const pages = totals[date] ?? 0;
          const isToday = date === today;
          const isFuture = date > today;

          return (
            <span
              key={date}
              title={`${date}: ${pages}`}
              className={`aspect-square rounded-xs ${LEVELS[intensity(pages)]} ${isToday ? "ring-1 ring-emerald-300/80" : ""} ${isFuture ? "opacity-30" : ""}`}
            />
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-between gap-4">
        <p className="font-mono text-xs text-zinc-600">
          {t(dictionary.desk.heatmapStats, { days: activeDays })}
        </p>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[0.6rem] text-zinc-600">
            {dictionary.desk.heatmapLess}
          </span>
          {LEVELS.map((level) => (
            <span key={level} className={`size-2.5 rounded-xs ${level}`} />
          ))}
          <span className="font-mono text-[0.6rem] text-zinc-600">
            {dictionary.desk.heatmapMore}
          </span>
        </div>
      </div>
    </div>
  );
}
