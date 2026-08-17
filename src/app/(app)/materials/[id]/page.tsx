import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookRecord } from "@/components/books/book-record";
import { LibraryActions } from "@/components/books/library-actions";
import { MaterialNotes } from "@/components/books/material-notes";
import { MaterialEditor } from "@/components/materials/material-editor";
import { TagList } from "@/components/materials/tag-list";
import { getDictionary } from "@/i18n/get-dictionary";
import { getCollections } from "@/lib/library/collections";
import {
  getMaterial,
  getMaterialNote,
  getMaterialPace,
} from "@/lib/library/materials";
import { metricUnit } from "@/lib/metric";

type MaterialPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: MaterialPageProps): Promise<Metadata> {
  const { id } = await params;
  const [material, dictionary] = await Promise.all([
    getMaterial(id),
    getDictionary(),
  ]);
  if (!material) return { title: dictionary.brand };
  return { title: `${material.title} · ${dictionary.brand}` };
}

export default async function MaterialPage({ params }: MaterialPageProps) {
  const { id } = await params;
  const [material, dictionary] = await Promise.all([
    getMaterial(id),
    getDictionary(),
  ]);

  if (!material) {
    notFound();
  }

  const [note, pace, collections] = await Promise.all([
    getMaterialNote(material.id),
    getMaterialPace(material.id),
    getCollections(),
  ]);

  const statusLabel =
    material.status === "active"
      ? dictionary.book.onDesk
      : material.status === "completed"
        ? dictionary.vault.statusCompleted
        : dictionary.vault.statusShelved;

  const backHref = material.status === "active" ? "/desk" : "/library";
  const backLabel =
    material.status === "active"
      ? dictionary.book.backToDesk
      : dictionary.book.backToVault;

  const unit = metricUnit(
    dictionary,
    material.metric_type,
    material.total_pages ?? undefined,
  );
  const totalLabel = material.total_pages
    ? `${material.total_pages} ${unit}`
    : null;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-10 sm:px-8">
      <Link
        href={backHref}
        className="mb-8 w-fit font-mono text-[0.65rem] tracking-[0.2em] text-muted uppercase transition hover:text-foreground"
      >
        {backLabel}
      </Link>
      <p className="mb-3 font-mono text-[0.65rem] tracking-[0.22em] text-accent uppercase">
        {statusLabel}
      </p>
      <BookRecord
        dictionary={dictionary}
        book={{
          title: material.title,
          author: material.author,
          coverUrl: material.cover_url,
          description: material.description,
          publishedDate: material.published_date,
          publisher: material.publisher,
          categories: material.categories,
          pageCount: material.total_pages,
          totalLabel,
        }}
        actions={
          <div className="flex flex-col gap-4">
            <TagList tags={material.tags} />
            <LibraryActions material={material} pace={pace} />
          </div>
        }
      />
      <MaterialNotes materialId={material.id} initialBody={note?.body ?? ""} />
      <MaterialEditor material={material} collections={collections} />
    </main>
  );
}
