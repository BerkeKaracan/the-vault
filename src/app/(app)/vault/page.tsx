import Link from "next/link";
import { getVaultMaterials } from "@/app/(app)/materials-actions";
import { Cover } from "@/components/materials/cover";
import { getDictionary } from "@/i18n/get-dictionary";
import { t } from "@/i18n/t";

export default async function VaultPage() {
  const [materials, dictionary] = await Promise.all([
    getVaultMaterials(),
    getDictionary(),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-lg font-medium tracking-tight text-zinc-100">
            {dictionary.vault.title}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {t(dictionary.vault.subtitle, { count: materials.length })}
          </p>
        </div>
        <Link
          href="/add"
          className="text-sm text-zinc-400 underline underline-offset-4 hover:text-zinc-200"
        >
          {dictionary.vault.add}
        </Link>
      </div>

      {materials.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-zinc-800 px-6 py-16 text-center text-sm text-zinc-600">
          {dictionary.vault.empty}
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {materials.map((material) => (
            <li key={material.id} className="group">
              <Cover
                title={material.title}
                author={material.author}
                coverUrl={material.cover_url}
              />
              <p className="mt-2 line-clamp-2 text-sm text-zinc-300 opacity-0 transition group-hover:opacity-100">
                {material.title}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
