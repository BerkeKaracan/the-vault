import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { getDictionary } from "@/i18n/get-dictionary";
import { t } from "@/i18n/t";
import { getStatsSummary } from "@/lib/progress/stats";

export async function generateMetadata(): Promise<Metadata> {
  const dictionary = await getDictionary();
  return { title: `${dictionary.stats.title} · ${dictionary.brand}` };
}

export default async function StatsPage() {
  const [dictionary, stats] = await Promise.all([
    getDictionary(),
    getStatsSummary(),
  ]);

  const isEmpty =
    stats.yearDays === 0 && stats.yearPages === 0 && stats.completed === 0;

  const cards = [
    {
      label: `${dictionary.stats.thisMonth} · ${dictionary.stats.activeDays}`,
      value: String(stats.monthDays),
    },
    {
      label: `${dictionary.stats.thisMonth} · ${dictionary.stats.pages}`,
      value: String(stats.monthPages),
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
      label: dictionary.stats.completed,
      value: String(stats.completed),
    },
    {
      label: dictionary.stats.streak,
      value: t(dictionary.stats.daysUnit, { count: stats.streak }),
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
    </main>
  );
}
