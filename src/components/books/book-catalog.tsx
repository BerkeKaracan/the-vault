"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { addGoogleBook } from "@/app/(app)/materials-actions";
import { Cover } from "@/components/materials/cover";
import type { Dictionary, ErrorKey } from "@/i18n/dictionaries";
import { useI18n } from "@/i18n/provider";
import { t } from "@/i18n/t";
import {
  BOOK_SHELVES,
  CATALOG_PAGE_SIZE,
  DEFAULT_BOOK_SHELF,
  googleQueryFor,
  type BookShelfId,
} from "@/lib/book-shelves";
import type { GoogleBookResult } from "@/lib/google-books";
import type { MetricType } from "@/lib/types";

function translateError(
  dictionary: ReturnType<typeof useI18n>["dictionary"],
  code: string,
) {
  if (code in dictionary.errors) {
    return dictionary.errors[code as ErrorKey];
  }
  return code;
}

function shelfLabel(dictionary: Dictionary, id: BookShelfId) {
  return dictionary.add.shelves[id];
}

export function BookCatalog({
  initialBooks,
  metricType,
  tags,
}: {
  initialBooks: GoogleBookResult[];
  metricType: MetricType;
  tags: string;
}) {
  const { dictionary } = useI18n();
  const router = useRouter();
  const [shelf, setShelf] = useState<BookShelfId>(DEFAULT_BOOK_SHELF);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [books, setBooks] = useState(initialBooks);
  const [hasMore, setHasMore] = useState(initialBooks.length >= CATALOG_PAGE_SIZE);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const skipInitialFetch = useRef(initialBooks.length > 0);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 400);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (skipInitialFetch.current) {
      skipInitialFetch.current = false;
      if (shelf === DEFAULT_BOOK_SHELF && debouncedQuery === "") return;
    }

    const controller = new AbortController();
    void loadBooks({
      replace: true,
      startIndex: 0,
      signal: controller.signal,
    });
    return () => controller.abort();
  }, [shelf, debouncedQuery]);

  async function loadBooks({
    replace,
    startIndex,
    signal,
  }: {
    replace: boolean;
    startIndex: number;
    signal?: AbortSignal;
  }) {
    const request = googleQueryFor(shelf, debouncedQuery);
    if (request.q.length === 1) return;

    setSearchError(null);
    if (replace) {
      setActionMessage(null);
      setBooks([]);
      setHasMore(false);
    }
    setSearching(true);

    try {
      const params = new URLSearchParams();
      if (request.q) params.set("q", request.q);
      if (request.subject) params.set("subject", request.subject);
      params.set("orderBy", request.orderBy);
      params.set("startIndex", String(startIndex));

      const res = await fetch(`/api/books/search?${params.toString()}`, {
        signal,
      });
      const data = (await res.json()) as {
        books?: GoogleBookResult[];
        hasMore?: boolean;
        error?: string;
        errorKey?: ErrorKey;
      };

      if (!res.ok) {
        if (replace) setBooks([]);
        setHasMore(false);
        setSearchError(
          data.error ??
            (data.errorKey
              ? translateError(dictionary, data.errorKey)
              : dictionary.add.searchFailed),
        );
        return;
      }

      const next = data.books ?? [];
      setBooks((current) => {
        if (replace) return next;
        const seen = new Set(current.map((book) => book.id));
        return [...current, ...next.filter((book) => !seen.has(book.id))];
      });
      setHasMore(data.hasMore ?? next.length >= CATALOG_PAGE_SIZE);
      if (replace && next.length === 0) {
        setSearchError(dictionary.add.noResults);
      }
    } catch (error) {
      if (signal?.aborted || (error instanceof DOMException && error.name === "AbortError")) {
        return;
      }
      if (replace) setBooks([]);
      setHasMore(false);
      setSearchError(dictionary.add.searchFailed);
    } finally {
      if (!signal?.aborted) setSearching(false);
    }
  }

  function saveBook(book: GoogleBookResult, status: "active" | "shelved") {
    setActionMessage(null);
    setPendingId(book.id);
    startTransition(async () => {
      const result = await addGoogleBook(book.id, status, {
        metricType,
        tags,
      });
      setPendingId(null);
      if (!result.ok) {
        setActionMessage(translateError(dictionary, result.error));
        return;
      }
      router.push(`/materials/${result.data.id}`);
    });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setDebouncedQuery(query.trim());
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={dictionary.add.searchPlaceholder}
          className="flex-1 rounded-md border border-border bg-elevated px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted focus:border-accent/50"
        />
        <button
          type="submit"
          disabled={searching}
          className="rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background transition hover:bg-foreground disabled:opacity-40"
        >
          {searching ? dictionary.add.searching : dictionary.add.search}
        </button>
      </form>

      <div className="flex flex-wrap gap-1.5">
        {BOOK_SHELVES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setShelf(item.id)}
            className={`rounded-full border px-2.5 py-1 font-mono text-[0.62rem] tracking-wide uppercase ${
              shelf === item.id
                ? "border-foreground/25 bg-foreground/8 text-foreground"
                : "border-border text-muted hover:text-foreground/80"
            }`}
          >
            {shelfLabel(dictionary, item.id)}
          </button>
        ))}
      </div>

      {actionMessage ? (
        <output className="rounded-md border border-border bg-elevated/80 px-3 py-2 text-sm text-foreground/80">
          {actionMessage}
        </output>
      ) : null}

      {searchError ? (
        <p className="text-sm text-muted">{searchError}</p>
      ) : null}

      <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {searching && books.length === 0
          ? Array.from({ length: 10 }, (_, index) => (
              <li
                key={index}
                className="aspect-2/3 animate-pulse rounded-sm bg-foreground/6"
              />
            ))
          : books.map((book) => (
              <li key={book.id} className="flex flex-col">
                <Link
                  href={`/discover/${encodeURIComponent(book.id)}`}
                  className="block"
                >
                  <Cover
                    title={book.title}
                    author={book.authors.join(", ")}
                    coverUrl={book.coverUrl}
                    sizes="(max-width: 640px) 45vw, 180px"
                  />
                </Link>
                <Link
                  href={`/discover/${encodeURIComponent(book.id)}`}
                  className="mt-3 line-clamp-2 font-display text-sm leading-snug font-semibold tracking-[-0.02em] text-foreground hover:text-foreground"
                >
                  {book.title}
                </Link>
                <p className="mt-1 truncate text-xs text-muted">
                  {book.authors.join(", ") || dictionary.add.noAuthor}
                </p>
                <p className="mt-0.5 font-mono text-[0.65rem] text-muted">
                  {book.pageCount
                    ? t(dictionary.add.pages, { count: book.pageCount })
                    : dictionary.add.pagesUnknown}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => saveBook(book, "active")}
                    className="rounded-md bg-foreground px-2 py-1 text-[0.7rem] font-medium text-background disabled:opacity-40"
                  >
                    {pending && pendingId === book.id
                      ? dictionary.busy
                      : dictionary.add.addToDesk}
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => saveBook(book, "shelved")}
                    className="rounded-md border border-border px-2 py-1 text-[0.7rem] text-foreground/80 hover:border-foreground/25 disabled:opacity-40"
                  >
                    {dictionary.add.addToVault}
                  </button>
                </div>
              </li>
            ))}
      </ul>

      {hasMore && books.length > 0 ? (
        <button
          type="button"
          disabled={searching}
          onClick={() =>
            void loadBooks({ replace: false, startIndex: books.length })
          }
          className="self-center rounded-full border border-border px-4 py-2 text-sm text-foreground/80 transition hover:border-foreground/25 hover:bg-foreground/5 disabled:opacity-40"
        >
          {searching ? dictionary.add.searching : dictionary.add.loadMore}
        </button>
      ) : null}
    </div>
  );
}
