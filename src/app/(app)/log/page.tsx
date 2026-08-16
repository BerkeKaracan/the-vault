import { LogCalendar } from "@/components/log/log-calendar";
import { PageHeader } from "@/components/page-header";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocalDateString } from "@/lib/local-date";
import { getMonthLog } from "@/lib/log";
import { getSessionProfile } from "@/lib/profile";

type LogPageProps = {
  searchParams: Promise<{ y?: string; m?: string; d?: string }>;
};

export default async function LogPage({ searchParams }: LogPageProps) {
  const params = await searchParams;
  const today = new Date();
  const year = Number.parseInt(params.y ?? "", 10) || today.getFullYear();
  const month = Number.parseInt(params.m ?? "", 10) || today.getMonth() + 1;
  const safeMonth = Math.min(12, Math.max(1, month));
  const selected =
    params.d && /^\d{4}-\d{2}-\d{2}$/.test(params.d)
      ? params.d
      : getLocalDateString(today);

  const [dictionary, session, data] = await Promise.all([
    getDictionary(),
    getSessionProfile(),
    getMonthLog(year, safeMonth),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-10 sm:px-8">
      <PageHeader
        title={dictionary.log.title}
        subtitle={dictionary.log.subtitle}
      />
      {Object.keys(data.totals).length === 0 ? (
        <p className="mt-8 text-sm text-muted">{dictionary.log.empty}</p>
      ) : null}
      <LogCalendar
        year={year}
        month={safeMonth}
        selected={selected}
        weekStartsOn={session.profile?.week_starts_on ?? "monday"}
        data={data}
      />
    </main>
  );
}
