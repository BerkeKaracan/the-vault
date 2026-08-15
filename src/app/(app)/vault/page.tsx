import Link from "next/link";
import { VaultGrid } from "@/components/vault/vault-grid";
import { getDictionary } from "@/i18n/get-dictionary";
import { t } from "@/i18n/t";
import { getVaultMaterials } from "@/lib/materials";

export default async function VaultPage() {
  const [materials, dictionary] = await Promise.all([
    getVaultMaterials(),
    getDictionary(),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-[-0.03em] text-foreground">
            {dictionary.vault.title}
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            {t(dictionary.vault.subtitle, { count: materials.length })}
          </p>
        </div>
        <Link
          href="/add"
          className="rounded-full border border-border px-4 py-1.5 text-sm text-foreground/80 transition hover:border-foreground/25 hover:bg-foreground/5 hover:text-foreground"
        >
          {dictionary.vault.add}
        </Link>
      </div>

      <VaultGrid materials={materials} />
    </main>
  );
}
