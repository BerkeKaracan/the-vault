import { PageHeader } from "@/components/page-header";
import { getDictionary } from "@/i18n/get-dictionary";
import { t } from "@/i18n/t";
import { getStatsSummary } from "@/lib/progress/stats";

export default async function StatsPage() {
  const [dictionary, stats] = await Promise.all([
    getDictionary(),
    getStatsSummary(),
  ]);

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
      <dl className="mt-10 grid gap-px overflow-hidden rounded-xl border border-border bg-foreground/5 sm:grid-cols-2 lg:grid-cols-3">
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
