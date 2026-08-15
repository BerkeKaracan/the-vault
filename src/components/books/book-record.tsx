import type { ReactNode } from "react";
import { Cover } from "@/components/materials/cover";
import type { Dictionary } from "@/i18n/dictionaries";
import { t } from "@/i18n/t";
import { descriptionParagraphs } from "@/lib/text";

export type BookRecordData = {
  title: string;
  author?: string | null;
  coverUrl?: string | null;
  description?: string | null;
  publishedDate?: string | null;
  publisher?: string | null;
  categories?: string[] | null;
  pageCount?: number | null;
  totalLabel?: string | null;
};

export function BookRecord({
  book,
  dictionary,
  actions,
}: {
  book: BookRecordData;
  dictionary: Dictionary;
  actions?: ReactNode;
}) {
  const paragraphs = descriptionParagraphs(book.description);
  const categories = book.categories ?? [];

  return (
    <div className="flex flex-col gap-10">
      <div className="grid gap-8 md:grid-cols-[220px_1fr] md:items-start">
        <div className="mx-auto w-40 md:mx-0 md:w-full">
          <Cover
            title={book.title}
            author={book.author}
            coverUrl={book.coverUrl}
            priority
            sizes="(max-width: 768px) 160px, 220px"
          />
        </div>
        <div className="min-w-0">
          <h1
            data-private
            className="font-display text-3xl font-semibold tracking-[-0.04em] text-foreground"
          >
            {book.title}
          </h1>
          {book.author ? (
            <p data-private className="mt-2 text-sm text-muted">
              {book.author}
            </p>
          ) : (
            <p className="mt-2 text-sm text-muted">{dictionary.add.noAuthor}</p>
          )}
          <ul className="mt-5 flex flex-wrap gap-2 font-mono text-[0.7rem] tracking-wide text-muted uppercase">
            {book.pageCount ? (
              <li
                data-private
                className="rounded-full border border-border px-2.5 py-1"
              >
                {book.totalLabel ??
                  t(dictionary.add.pages, { count: book.pageCount })}
              </li>
            ) : null}
            {book.publishedDate ? (
              <li className="rounded-full border border-border px-2.5 py-1">
                {book.publishedDate}
              </li>
            ) : null}
            {book.publisher ? (
              <li className="rounded-full border border-border px-2.5 py-1">
                {book.publisher}
              </li>
            ) : null}
            {categories.slice(0, 4).map((category) => (
              <li
                key={category}
                className="rounded-full border border-border px-2.5 py-1"
              >
                {category}
              </li>
            ))}
          </ul>
          {actions ? <div className="mt-8">{actions}</div> : null}
        </div>
      </div>

      <section>
        <h2 className="font-mono text-[0.65rem] tracking-[0.22em] text-muted uppercase">
          {dictionary.book.about}
        </h2>
        {paragraphs.length > 0 ? (
          <div className="mt-4 max-w-3xl space-y-4">
            {paragraphs.map((para) => (
              <p
                key={para}
                className="text-[0.95rem] leading-[1.75] text-foreground/80"
              >
                {para}
              </p>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted">
            {dictionary.book.noDescription}
          </p>
        )}
      </section>
    </div>
  );
}
