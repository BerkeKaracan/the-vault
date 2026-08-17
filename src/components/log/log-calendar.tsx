"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n/provider";
import { t } from "@/i18n/t";
import { getLocalDateString } from "@/lib/local-date";
import { metricUnit } from "@/lib/metric";
import { signedDeltaLabel, signedEntryId } from "@/lib/progress/day";
import type { MonthLog } from "@/lib/progress/log";

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function parseLocalDay(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function LogCalendar({
  year,
  month,
  selected,
  weekStartsOn,
  data,
}: {
  year: number;
  month: number;
  selected: string;
  weekStartsOn: "monday" | "sunday";
  data: MonthLog;
}) {
  const { dictionary, locale } = useI18n();
  const router = useRouter();
  const today = getLocalDateString();
  const count = daysInMonth(year, month);
  const first = new Date(year, month - 1, 1);
  const weekday = first.getDay();
  const offset = weekStartsOn === "sunday" ? weekday : (weekday + 6) % 7;
  const cells: string[] = [
    ...Array.from({ length: offset }, (_, i) => `pad:${i}`),
    ...Array.from({ length: count }, (_, i) => {
      const day = i + 1;
      return `${year}-${pad(month)}-${pad(day)}`;
    }),
  ];

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const dateLocale = locale === "tr" ? "tr-TR" : "en-US";
  const monthLabel = new Intl.DateTimeFormat(dateLocale, {
    month: "long",
    year: "numeric",
  }).format(first);
  const dayFormatter = new Intl.DateTimeFormat(dateLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  function dayLabel(date: string, total: number): string {
    const formatted = dayFormatter.format(parseLocalDay(date));
    return total > 0
      ? t(dictionary.desk.heatmapCell, { date: formatted, count: total })
      : t(dictionary.desk.heatmapCellEmpty, { date: formatted });
  }
  const weekdayLabels = Array.from({ length: 7 }, (_, i) => {
    const day = weekStartsOn === "sunday" ? i : i + 1;
    return new Intl.DateTimeFormat(dateLocale, { weekday: "short" }).format(
      new Date(2024, 0, day),
    );
  });

  const dayEntries = data.entries[selected] ?? [];

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_16rem]">
      <div>
        <div className="flex items-center justify-between gap-3">
          <Link
            href={`/log?y=${prevYear}&m=${prevMonth}`}
            className="font-mono text-[0.65rem] tracking-wide text-muted uppercase hover:text-foreground"
          >
            {dictionary.log.prev}
          </Link>
          <p className="font-display text-lg font-semibold tracking-[-0.03em] text-foreground">
            {monthLabel}
          </p>
          <Link
            href={`/log?y=${nextYear}&m=${nextMonth}`}
            className="font-mono text-[0.65rem] tracking-wide text-muted uppercase hover:text-foreground"
          >
            {dictionary.log.next}
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-7 gap-1">
          {weekdayLabels.map((label) => (
            <p
              key={label}
              className="pb-1 text-center font-mono text-[0.58rem] tracking-wide text-muted uppercase"
            >
              {label}
            </p>
          ))}
          {cells.map((cell) => {
            if (cell.startsWith("pad:")) {
              return <div key={cell} className="aspect-square" />;
            }
            const date = cell;
            const total = data.totals[date] ?? 0;
            const isSelected = date === selected;
            const isToday = date === today;
            const heat =
              total <= 0
                ? "bg-foreground/5 text-muted"
                : total < 5
                  ? "bg-accent/20 text-foreground"
                  : total < 15
                    ? "bg-accent/40 text-foreground"
                    : "bg-accent/70 text-foreground";
            return (
              <button
                key={date}
                type="button"
                aria-label={dayLabel(date, total)}
                aria-pressed={isSelected}
                onClick={() =>
                  router.push(`/log?y=${year}&m=${month}&d=${date}`, {
                    scroll: false,
                  })
                }
                className={`aspect-square cursor-pointer rounded-sm text-[0.7rem] transition hover:ring-1 hover:ring-foreground/40 ${heat} ${
                  isSelected ? "ring-1 ring-foreground/70" : ""
                } ${isToday ? "ring-1 ring-accent/80" : ""}`}
              >
                {Number(date.slice(8))}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <p className="font-display text-base font-semibold tracking-[-0.02em] text-foreground">
          {dayFormatter.format(parseLocalDay(selected))}
        </p>
        <p className="mt-1 font-mono text-[0.62rem] tracking-[0.18em] text-muted uppercase">
          {t(dictionary.log.dayCount, {
            count: data.totals[selected] ?? 0,
          })}
          {selected === today ? ` · ${dictionary.log.today}` : ""}
        </p>
        {dayEntries.length === 0 ? (
          <p className="mt-3 text-sm text-muted">{dictionary.log.emptyDay}</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {dayEntries.map((entry) => (
              <li key={signedEntryId(entry)}>
                <Link
                  href={`/materials/${entry.materialId}`}
                  data-private
                  className="text-sm text-foreground hover:text-foreground"
                >
                  {entry.title}
                </Link>
                <p className="font-mono text-[0.65rem] text-muted">
                  {signedDeltaLabel(entry.delta)}{" "}
                  {metricUnit(
                    dictionary,
                    entry.metricType,
                    Math.abs(entry.delta),
                  )}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
