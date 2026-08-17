import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookRecord } from "@/components/books/book-record";
import { DiscoverActions } from "@/components/books/discover-actions";
import { getDictionary } from "@/i18n/get-dictionary";
import {
  type GoogleBookResult,
  GoogleBooksError,
  getGoogleBook,
  isGoogleVolumeId,
} from "@/lib/catalog/google-books";
import { findMaterialByGoogleId } from "@/lib/library/materials";

type DiscoverPageProps = {
  params: Promise<{ googleId: string }>;
};

export async function generateMetadata({
  params,
}: DiscoverPageProps): Promise<Metadata> {
  const { googleId } = await params;
  if (!isGoogleVolumeId(googleId)) {
    return { title: "The Vault" };
  }
  try {
    const book = await getGoogleBook(googleId);
    if (!book) return { title: "The Vault" };
    return { title: `${book.title} · The Vault` };
  } catch {
    return { title: "The Vault" };
  }
}

export default async function DiscoverPage({ params }: DiscoverPageProps) {
  const { googleId } = await params;
  const dictionary = await getDictionary();

  if (!isGoogleVolumeId(googleId)) {
    notFound();
  }

  let book: GoogleBookResult | null;
  try {
    book = await getGoogleBook(googleId);
  } catch (error) {
    const unavailable =
      error instanceof GoogleBooksError &&
      (error.status === 429 || error.status === 503 || error.status >= 500);
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-10 sm:px-8">
        <p className="text-sm text-muted">
          {unavailable
            ? dictionary.errors.booksUnavailable
            : dictionary.errors.booksFailed}
        </p>
      </main>
    );
  }

  if (!book) {
    notFound();
  }

  const owned = await findMaterialByGoogleId(book.id);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-10 sm:px-8">
      <Link
        href="/discover"
        className="mb-8 w-fit font-mono text-[0.65rem] tracking-[0.2em] text-muted uppercase transition hover:text-foreground"
      >
        {dictionary.book.backToAdd}
      </Link>
      <BookRecord
        dictionary={dictionary}
        book={{
          title: book.title,
          author: book.authors.join(", ") || null,
          coverUrl: book.coverUrl,
          description: book.description,
          publishedDate: book.publishedDate,
          publisher: book.publisher,
          categories: book.categories,
          pageCount: book.pageCount,
        }}
        actions={
          <DiscoverActions
            googleId={book.id}
            ownedHref={owned ? `/materials/${owned.id}` : null}
          />
        }
      />
    </main>
  );
}
