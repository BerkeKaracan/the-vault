import { ActiveDeskEmpty } from "@/components/desk/active-desk-empty";
import { Cover } from "@/components/materials/cover";
import { getDictionary } from "@/i18n/get-dictionary";
import { t } from "@/i18n/t";
import type { Material } from "@/lib/types";

function progressPercent(material: Material) {
  if (!material.total_pages || material.total_pages <= 0) return null;
  return Math.min(
    100,
    Math.round((material.current_page / material.total_pages) * 100),
  );
}

export async function ActiveDesk({ materials }: { materials: Material[] }) {
  const dictionary = await getDictionary();

  if (materials.length === 0) {
    return <ActiveDeskEmpty />;
  }

  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {materials.map((material, index) => {
        const percent = progressPercent(material);
        const progress = material.total_pages
          ? t(dictionary.desk.pageOf, {
              current: material.current_page,
              total: material.total_pages,
            })
          : t(dictionary.desk.pageOnly, { page: material.current_page });

        return (
          <li
            key={material.id}
            className="group flex flex-col gap-4 rounded-lg border border-zinc-900 bg-zinc-950/50 p-4 transition hover:border-zinc-700"
          >
            <div className="mx-auto w-36 sm:mx-0 sm:w-40">
              <Cover
                title={material.title}
                author={material.author}
                coverUrl={material.cover_url}
                priority={index === 0}
              />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <h3 className="line-clamp-2 text-base font-medium tracking-tight text-zinc-100">
                {material.title}
              </h3>
              {material.author ? (
                <p className="truncate text-sm text-zinc-500">
                  {material.author}
                </p>
              ) : null}
              <p className="font-mono text-xs text-zinc-600">
                {progress}
                {percent !== null ? ` · %${percent}` : ""}
              </p>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-900">
                <div
                  className="h-full rounded-full bg-accent transition-[width] duration-500"
                  style={{ width: `${percent ?? 8}%` }}
                />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
