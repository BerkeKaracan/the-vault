"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  getHeatmapData,
  type HeatmapDayEntry,
} from "@/app/(app)/materials-actions";
import type { Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import { t } from "@/i18n/t";
import { getLocalDateString } from "@/lib/local-date";
import { metricUnit } from "@/lib/metric";
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

function parseLocalDay(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

function formatDay(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parseLocalDay(iso));
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

function HeatTip({
  heading,
  lines,
  x,
  y,
  hostWidth,
}: {
  heading: string;
  lines: { id: string; text: string }[];
  x: number;
  y: number;
  hostWidth: number;
}) {
  const below = y < 72;
  const left = Math.min(Math.max(x, 124), Math.max(124, hostWidth - 124));

  return (
    <div
      id="heatmap-tip"
      role="tooltip"
      className={`pointer-events-none absolute z-30 w-max max-w-64 -translate-x-1/2 rounded-md border border-border bg-elevated px-2.5 py-1.5 text-foreground shadow-[0_12px_40px_-18px_rgba(0,0,0,0.55)] ${below ? "" : "-translate-y-full"}`}
      style={{ left, top: below ? y + 14 : y - 8 }}
    >
      <p className="font-mono text-[0.62rem] text-muted">{heading}</p>
      {lines.length > 0 ? (
        <ul className="mt-1.5 space-y-1">
          {lines.map((line) => (
            <li
              key={line.id}
              data-private
              className="text-[0.72rem] leading-snug text-foreground"
            >
              {line.text}
            </li>
          ))}
        </ul>
      ) : null}
      <span
        aria-hidden
        className={`absolute left-1/2 size-1.5 -translate-x-1/2 rotate-45 border-border bg-elevated ${below ? "bottom-full translate-y-1/2 border-t border-l" : "top-full -translate-y-1/2 border-r border-b"}`}
      />
    </div>
  );
}

type Tip = {
  date: string;
  pinned: boolean;
  x: number;
  y: number;
};

export function ContributionHeatmap({
  weekStartsOn = "monday",
  dailyGoal = null,
}: {
  weekStartsOn?: WeekStart;
  dailyGoal?: number | null;
}) {
  const { dictionary, locale } = useI18n();
  const hostRef = useRef<HTMLDivElement>(null);
  const fromDate = useMemo(
    () => weekStartWeeksAgo(WEEKS, weekStartsOn),
    [weekStartsOn],
  );
  const from = useMemo(() => getLocalDateString(fromDate), [fromDate]);
  const days = useMemo(() => eachLocalDay(fromDate, DAYS), [fromDate]);
  const today = useMemo(() => getLocalDateString(), []);
  const [totals, setTotals] = useState<Record<string, number>>({});
  const [entries, setEntries] = useState<Record<string, HeatmapDayEntry[]>>({});
  const [loaded, setLoaded] = useState(false);
  const [tip, setTip] = useState<Tip | null>(null);

  useEffect(() => {
    let cancelled = false;
    getHeatmapData(from)
      .then((data) => {
        if (!cancelled) {
          setTotals(data.totals);
          setEntries(data.entries);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [from]);

  useEffect(() => {
    if (!tip?.pinned) return;
    function hide(event: PointerEvent) {
      if (hostRef.current?.contains(event.target as Node)) return;
      setTip(null);
    }
    window.addEventListener("pointerdown", hide);
    return () => window.removeEventListener("pointerdown", hide);
  }, [tip?.pinned]);

  const activeDays = Object.values(totals).filter((n) => n > 0).length;

  function entryLine(entry: HeatmapDayEntry): string {
    return t(dictionary.desk.heatmapEntry, {
      count: entry.delta,
      unit: metricUnit(dictionary, entry.metricType, Math.abs(entry.delta)),
      title: entry.title,
    });
  }

  function heading(
    date: string,
    count: number,
    goalMet: boolean,
    future: boolean,
  ) {
    const formatted = formatDay(date, locale);
    if (future) {
      return t(dictionary.desk.heatmapCellFuture, { date: formatted });
    }
    if (goalMet) {
      return t(dictionary.desk.heatmapCellGoal, {
        date: formatted,
        count,
        goal: dictionary.desk.goalMet,
      });
    }
    if (count <= 0) {
      return t(dictionary.desk.heatmapCellEmpty, { date: formatted });
    }
    return t(dictionary.desk.heatmapCell, { date: formatted, count });
  }

  function placeTip(
    event: { currentTarget: HTMLElement },
    date: string,
    pinned: boolean,
  ) {
    const host = hostRef.current;
    if (!host) return;
    const cell = event.currentTarget.getBoundingClientRect();
    const box = host.getBoundingClientRect();
    setTip({
      date,
      pinned,
      x: cell.left - box.left + cell.width / 2,
      y: cell.top - box.top,
    });
  }

  return (
    <div ref={hostRef} className="relative mx-auto w-full max-w-5xl">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-mono text-[0.58rem] tracking-[0.22em] text-muted uppercase">
          {dictionary.desk.consistency}
        </p>
        <p className="font-mono text-[0.58rem] text-muted">
          {t(dictionary.desk.heatmapStats, { days: activeDays })}
        </p>
      </div>
      {loaded && activeDays === 0 ? (
        <p className="mb-2 font-mono text-[0.62rem] text-muted">
          {dictionary.desk.heatmapEmptyCaption}
        </p>
      ) : null}
      <div
        className={`grid w-full grid-flow-col grid-rows-7 gap-0.75 ${loaded ? "" : "opacity-40"}`}
      >
        {days.map((date) => {
          const pages = Math.max(0, totals[date] ?? 0);
          const dayEntries = entries[date] ?? [];
          const isToday = date === today;
          const isFuture = date > today;
          const goalMet =
            dailyGoal != null && dailyGoal > 0 && pages >= dailyGoal;
          const label = [
            heading(date, pages, goalMet, isFuture),
            ...dayEntries.map(entryLine),
          ].join(". ");

          return (
            <button
              key={date}
              type="button"
              aria-label={label}
              aria-expanded={tip?.date === date}
              aria-describedby={tip?.date === date ? "heatmap-tip" : undefined}
              onMouseEnter={(event) => {
                if (tip?.pinned) return;
                placeTip(event, date, false);
              }}
              onFocus={(event) => {
                if (tip?.pinned) return;
                placeTip(event, date, false);
              }}
              onMouseDown={(event) => event.preventDefault()}
              onClick={(event) => {
                if (tip?.pinned && tip.date === date) {
                  setTip(null);
                  return;
                }
                placeTip(event, date, true);
              }}
              onMouseLeave={(event) => {
                if (tip?.pinned) return;
                const next = event.relatedTarget;
                if (
                  next instanceof HTMLElement &&
                  hostRef.current?.contains(next) &&
                  next.closest("button")
                ) {
                  return;
                }
                setTip(null);
              }}
              onBlur={() => {
                if (!tip?.pinned) setTip(null);
              }}
              className={`relative aspect-square cursor-pointer rounded-xs caret-transparent select-none outline-none transition-[box-shadow] hover:z-10 hover:ring-1 hover:ring-foreground/55 focus-visible:z-10 focus-visible:ring-1 focus-visible:ring-foreground ${heatClass(pages)} ${isToday ? "ring-1 ring-accent/80" : ""} ${tip?.date === date ? "z-10 ring-1 ring-foreground/70" : ""} ${isFuture ? "opacity-30" : ""}`}
            >
              {goalMet ? (
                <span
                  aria-hidden
                  className="absolute -top-px -right-px size-1.5 rounded-full bg-foreground shadow-[0_0_6px_var(--accent)]"
                />
              ) : null}
            </button>
          );
        })}
      </div>
      {tip ? (
        <HeatTip
          heading={heading(
            tip.date,
            Math.max(0, totals[tip.date] ?? 0),
            dailyGoal != null &&
              dailyGoal > 0 &&
              Math.max(0, totals[tip.date] ?? 0) >= dailyGoal,
            tip.date > today,
          )}
          lines={(entries[tip.date] ?? []).map((entry) => ({
            id: entry.materialId,
            text: entryLine(entry),
          }))}
          x={tip.x}
          y={tip.y}
          hostWidth={hostRef.current?.offsetWidth ?? 0}
        />
      ) : null}
      <div className="mt-2 flex items-center justify-end gap-1.5 font-mono text-[0.58rem] text-muted">
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
