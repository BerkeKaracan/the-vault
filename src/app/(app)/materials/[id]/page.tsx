import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookRecord } from "@/components/books/book-record";
import { LibraryActions } from "@/components/books/library-actions";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { localizeDescription } from "@/lib/localize-description";
import { getMaterial } from "@/lib/materials";

type MaterialPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: MaterialPageProps): Promise<Metadata> {
  const { id } = await params;
  const material = await getMaterial(id);
  if (!material) return { title: "The Vault" };
  return { title: `${material.title} · The Vault` };
}

export default async function MaterialPage({ params }: MaterialPageProps) {
  const { id } = await params;
  const [material, dictionary, locale] = await Promise.all([
    getMaterial(id),
    getDictionary(),
    getLocale(),
  ]);

  if (!material) {
    notFound();
  }

  const statusLabel =
    material.status === "active"
      ? dictionary.book.onDesk
      : material.status === "completed"
        ? dictionary.vault.statusCompleted
        : dictionary.vault.statusShelved;

  const backHref = material.status === "active" ? "/desk" : "/vault";
  const backLabel =
    material.status === "active"
      ? dictionary.book.backToDesk
      : dictionary.book.backToVault;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-10">
      <Link
        href={backHref}
        className="mb-8 w-fit font-mono text-[0.65rem] tracking-[0.2em] text-zinc-500 uppercase transition hover:text-zinc-300"
      >
        {backLabel}
      </Link>
      <p className="mb-3 font-mono text-[0.65rem] tracking-[0.22em] text-emerald-400/80 uppercase">
        {statusLabel}
      </p>
      <BookRecord
        dictionary={dictionary}
        book={{
          title: material.title,
          author: material.author,
          coverUrl: material.cover_url,
          description: await localizeDescription(material.description, locale),
          publishedDate: material.published_date,
          publisher: material.publisher,
          categories: material.categories,
          pageCount: material.total_pages,
        }}
        actions={<LibraryActions material={material} />}
      />
    </main>
  );
}
