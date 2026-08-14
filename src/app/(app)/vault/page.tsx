import Link from "next/link";
import { getVaultMaterials } from "@/app/(app)/materials-actions";
import { VaultGrid } from "@/components/vault/vault-grid";
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

      <VaultGrid materials={materials} />
    </main>
  );
}
