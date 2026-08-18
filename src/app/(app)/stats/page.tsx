import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { WeekChart } from "@/components/stats/week-chart";
import { getDictionary } from "@/i18n/get-dictionary";
import { t } from "@/i18n/t";
import { getStatsSummary } from "@/lib/progress/stats";

export async function generateMetadata(): Promise<Metadata> {
  const dictionary = await getDictionary();
  return { title: `${dictionary.stats.title} · ${dictionary.brand}` };
}

export default async function StatsPage() {
  const [dictionary, result] = await Promise.all([
    getDictionary(),
    getStatsSummary(),
  ]);

  if (!result.ok) {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-10 sm:px-8">
        <PageHeader
          title={dictionary.stats.title}
          subtitle={dictionary.stats.subtitle}
        />
        <p className="mt-10 text-sm text-muted">{dictionary.stats.loadError}</p>
      </main>
    );
  }

  const stats = result.data;
  const isEmpty =
    stats.yearDays === 0 &&
    stats.yearPages === 0 &&
    stats.yearQuestions === 0 &&
    stats.yearChapters === 0 &&
    stats.completed === 0;

  const cards = [
    {
      label: `${dictionary.stats.thisWeek} · ${dictionary.stats.activeDays}`,
      value: String(stats.weekDays),
    },
    {
      label: `${dictionary.stats.thisWeek} · ${dictionary.stats.pages}`,
      value: String(stats.weekPages),
    },
    {
      label: `${dictionary.stats.thisMonth} · ${dictionary.stats.activeDays}`,
      value: String(stats.monthDays),
    },
    {
      label: `${dictionary.stats.thisMonth} · ${dictionary.stats.pages}`,
      value: String(stats.monthPages),
    },
    {
      label: `${dictionary.stats.thisMonth} · ${dictionary.stats.questions}`,
      value: String(stats.monthQuestions),
    },
    {
      label: `${dictionary.stats.thisMonth} · ${dictionary.stats.chapters}`,
      value: String(stats.monthChapters),
    },
    {
      label: `${dictionary.stats.thisYear} · ${dictionary.stats.activeDays}`,
      value: String(stats.yearDays),
    },
    {
      label: `${dictionary.stats.thisYear} · ${dictionary.stats.pages}`,
      value: String(stats.yearPages),
    },
    {
      label: `${dictionary.stats.thisYear} · ${dictionary.stats.questions}`,
      value: String(stats.yearQuestions),
    },
    {
      label: `${dictionary.stats.thisYear} · ${dictionary.stats.chapters}`,
      value: String(stats.yearChapters),
    },
    {
      label: dictionary.stats.completed,
      value: String(stats.completed),
    },
    {
      label: dictionary.stats.currentStreak,
      value: t(dictionary.stats.daysUnit, { count: stats.currentStreak }),
    },
    {
      label: dictionary.stats.streak,
      value: t(dictionary.stats.daysUnit, { count: stats.longestStreak }),
    },
  ];

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-10 sm:px-8">
      <PageHeader
        title={dictionary.stats.title}
        subtitle={dictionary.stats.subtitle}
      />
      {isEmpty ? (
        <div className="mt-10 rounded-lg border border-dashed border-border px-6 py-14 text-center">
          <h2 className="font-display text-xl font-semibold tracking-[-0.03em] text-foreground">
            {dictionary.stats.emptyTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted">
            {dictionary.stats.emptyBody}
          </p>
          <Link
            href="/discover"
            className="mt-7 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-fg transition hover:opacity-90"
          >
            {dictionary.vault.emptyCta}
          </Link>
        </div>
      ) : null}
      <dl
        className={`mt-10 grid gap-px overflow-hidden rounded-xl border border-border bg-foreground/5 sm:grid-cols-2 lg:grid-cols-3 ${
          isEmpty ? "opacity-40" : ""
        }`}
      >
        {cards.map((card) => (
          <div key={card.label} className="bg-surface px-5 py-6">
            <dt className="font-mono text-[0.62rem] tracking-[0.18em] text-muted uppercase">
              {card.label}
            </dt>
            <dd
              data-private
              className="font-display mt-3 text-3xl font-semibold tracking-[-0.03em] text-foreground"
            >
              {card.value}
            </dd>
          </div>
        ))}
      </dl>
      {isEmpty ? null : (
        <WeekChart
          weeks={stats.weeks}
          title={dictionary.stats.weekChart}
          ariaLabel={dictionary.stats.weekChartAria}
        />
      )}
    </main>
  );
}
