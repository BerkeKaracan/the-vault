"use client";

import { useEffect, useMemo, useState } from "react";
import { getHeatmapTotals } from "@/app/(app)/materials-actions";
import { useI18n } from "@/i18n/provider";
import { t } from "@/i18n/t";
import { getLocalDateString } from "@/lib/local-date";

const WEEKS = 16;
const DAYS = WEEKS * 7;

function startDateLocal(daysBack: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - (daysBack - 1));
  return getLocalDateString(d);
}

function eachLocalDay(from: string, count: number): string[] {
  const [y, m, day] = from.split("-").map(Number);
  const cursor = new Date(y, m - 1, day);
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    out.push(getLocalDateString(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

function intensityClass(pages: number): string {
  if (pages <= 0) return "bg-zinc-900";
  if (pages < 10) return "bg-emerald-950";
  if (pages < 30) return "bg-emerald-800";
  if (pages < 60) return "bg-emerald-600";
  return "bg-emerald-400";
}

export function ContributionHeatmap() {
  const { dictionary } = useI18n();
  const from = useMemo(() => startDateLocal(DAYS), []);
  const days = useMemo(() => eachLocalDay(from, DAYS), [from]);
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
    <div>
      <div className="flex gap-1 overflow-x-auto pb-2">
        {days.map((date) => {
          const pages = totals[date] ?? 0;
          return (
            <div
              key={date}
              title={`${date}: ${pages}`}
              className={`aspect-square min-w-2.5 rounded-[2px] transition-colors ${intensityClass(pages)} ${loaded ? "" : "opacity-40"}`}
            />
          );
        })}
      </div>
      <p className="mt-3 font-mono text-xs text-zinc-600">
        {t(dictionary.desk.heatmapStats, { days: activeDays })}
      </p>
    </div>
  );
}
