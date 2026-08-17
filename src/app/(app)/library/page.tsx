import type { Metadata } from "next";
import Link from "next/link";
import { LibraryGrid } from "@/components/library/library-grid";
import { PageHeader } from "@/components/page-header";
import { getDictionary } from "@/i18n/get-dictionary";
import { t } from "@/i18n/t";
import { getCollections } from "@/lib/library/collections";
import { getLibraryMaterials } from "@/lib/library/materials";

export async function generateMetadata(): Promise<Metadata> {
  const dictionary = await getDictionary();
  return { title: `${dictionary.vault.title} · ${dictionary.brand}` };
}

export default async function LibraryPage() {
  const [materials, collections, dictionary] = await Promise.all([
    getLibraryMaterials(),
    getCollections(),
    getDictionary(),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-10 sm:px-8">
      <PageHeader
        title={dictionary.vault.title}
        subtitle={t(dictionary.vault.subtitle, { count: materials.length })}
        action={
          <Link
            href="/discover"
            className="rounded-full border border-border px-4 py-1.5 text-sm text-foreground/80 transition hover:border-foreground/25 hover:bg-foreground/5 hover:text-foreground"
          >
            {dictionary.vault.add}
          </Link>
        }
      />
      <LibraryGrid materials={materials} collections={collections} />
    </main>
  );
}
