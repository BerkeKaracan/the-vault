import { getActiveMaterials } from "@/app/(app)/materials-actions";
import { ActiveDesk } from "@/components/desk/active-desk";
import { ContributionHeatmap } from "@/components/heatmap/contribution-heatmap";
import { getDictionary } from "@/i18n/get-dictionary";
import { t } from "@/i18n/t";

export default async function DeskPage() {
  const [materials, dictionary] = await Promise.all([
    getActiveMaterials(),
    getDictionary(),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12">
      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-lg font-medium tracking-tight text-zinc-100">
              {dictionary.desk.title}
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              {t(dictionary.desk.subtitle, { count: materials.length })}
            </p>
          </div>
        </div>
        <div className="mt-6">
          <ActiveDesk materials={materials} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium tracking-tight text-zinc-100">
          {dictionary.desk.consistency}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          {dictionary.desk.consistencyHint}
        </p>
        <div className="mt-6">
          <ContributionHeatmap />
        </div>
      </section>
    </main>
  );
}
