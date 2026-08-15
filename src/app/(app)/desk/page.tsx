import Link from "next/link";
import { getActiveMaterials } from "@/app/(app)/materials-actions";
import { getSessionProfile } from "@/app/(app)/settings-actions";
import { ActiveDesk } from "@/components/desk/active-desk";
import { ContributionHeatmap } from "@/components/heatmap/contribution-heatmap";
import { getDictionary } from "@/i18n/get-dictionary";
import { t } from "@/i18n/t";

export default async function DeskPage() {
  const [materials, dictionary, session] = await Promise.all([
    getActiveMaterials(),
    getDictionary(),
    getSessionProfile(),
  ]);

  return (
    <main className="flex flex-1 flex-col gap-14">
      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-[-0.03em] text-zinc-50">
              {dictionary.desk.title}
            </h1>
            <p className="mt-1.5 text-sm text-zinc-500">
              {t(dictionary.desk.subtitle, { count: materials.length })}
            </p>
          </div>
          {materials.length < 3 ? (
            <Link
              href="/add"
              className="rounded-full border border-white/12 px-4 py-1.5 text-sm text-zinc-300 transition hover:border-white/25 hover:bg-white/4 hover:text-white"
            >
              {dictionary.desk.addMaterial}
            </Link>
          ) : null}
        </div>
        <div className="mt-8">
          <ActiveDesk materials={materials} />
        </div>
        {materials.length >= 3 ? (
          <p className="mt-4 text-sm text-zinc-600">{dictionary.desk.fullHint}</p>
        ) : null}
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold tracking-[-0.03em] text-zinc-50">
          {dictionary.desk.consistency}
        </h2>
        <p className="mt-1.5 text-sm text-zinc-500">
          {dictionary.desk.consistencyHint}
        </p>
        <div className="mt-8">
          <ContributionHeatmap
            weekStartsOn={session.profile?.week_starts_on ?? "monday"}
          />
        </div>
      </section>
    </main>
  );
}
