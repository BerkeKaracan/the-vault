"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { addGoogleBook } from "@/app/(app)/materials/[id]/actions";
import { Cover } from "@/components/materials/cover";
import { CoverSkeletonGrid } from "@/components/skeleton";
import type { Dictionary, ErrorKey } from "@/i18n/dictionaries";
import { useI18n } from "@/i18n/provider";
import { t } from "@/i18n/t";
import {
  BOOK_SHELVES,
  type BookShelfId,
  CATALOG_INDEX_CAP,
  DEFAULT_BOOK_SHELF,
  googleQueryFor,
} from "@/lib/catalog/book-shelves";
import type {
  GoogleBookResult,
  GoogleBooksPage,
} from "@/lib/catalog/google-books";
import {
  readDiscoverCache,
  restoreWindowScroll,
  writeDiscoverCache,
} from "@/lib/list-session";
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
  initialPage,
  metricType,
  tags,
}: {
  initialPage: GoogleBooksPage;
  metricType: MetricType;
  tags: string;
}) {
  const { dictionary } = useI18n();
  const router = useRouter();
  const [shelf, setShelf] = useState<BookShelfId>(DEFAULT_BOOK_SHELF);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [books, setBooks] = useState(initialPage.books);
  const [nextIndex, setNextIndex] = useState(initialPage.nextIndex);
  const [hasMore, setHasMore] = useState(
    initialPage.hasMore ||
      (initialPage.books.length > 0 &&
        initialPage.nextIndex < CATALOG_INDEX_CAP),
  );
  const [searchError, setSearchError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [searching, setSearching] = useState(initialPage.books.length === 0);
  const [replacing, setReplacing] = useState(initialPage.books.length === 0);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const skipDefaultFetch = useRef(initialPage.books.length > 0);
  const skipNextFetch = useRef(false);
  const loadingMoreRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const restoreY = useRef<number | null>(null);
  const restoreCount = useRef(0);
  const booksRef = useRef(initialPage.books);
  const nextIndexRef = useRef(initialPage.nextIndex);
  const snapshotRef = useRef({
    shelf,
    query: debouncedQuery,
    books,
    nextIndex,
    hasMore,
  });
  snapshotRef.current = {
    shelf,
    query: debouncedQuery,
    books,
    nextIndex,
    hasMore,
  };
  booksRef.current = books;
  nextIndexRef.current = nextIndex;

  useLayoutEffect(() => {
    const cache = readDiscoverCache();
    if (!cache) return;
    skipNextFetch.current = true;
    skipDefaultFetch.current = false;
    restoreY.current = cache.scrollY;
    restoreCount.current = cache.books.length;
    setShelf(cache.shelf);
    setQuery(cache.query);
    setDebouncedQuery(cache.query);
    setBooks(cache.books);
    setNextIndex(cache.nextIndex);
    setHasMore(cache.nextIndex < CATALOG_INDEX_CAP);
    setSearching(false);
    setReplacing(false);
  }, []);

  useLayoutEffect(() => {
    if (restoreY.current == null) return;
    if (books.length < restoreCount.current) return;
    restoreWindowScroll(restoreY.current);
  }, [books]);

  useEffect(() => {
    if (restoreY.current == null) return;
    if (books.length < restoreCount.current) return;
    restoreWindowScroll(restoreY.current);
    restoreY.current = null;
  }, [books]);

  useEffect(() => {
    const onHide = () => {
      writeDiscoverCache({
        ...snapshotRef.current,
        scrollY: window.scrollY,
      });
    };
    window.addEventListener("pagehide", onHide);
    return () => window.removeEventListener("pagehide", onHide);
  }, []);

  useEffect(() => {
    if (restoreY.current != null) return;
    writeDiscoverCache({
      shelf,
      query: debouncedQuery,
      books,
      nextIndex,
      hasMore,
      scrollY: window.scrollY,
    });
  }, [shelf, debouncedQuery, books, nextIndex, hasMore]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 400);
    return () => window.clearTimeout(timer);
  }, [query]);

  const loadBooks = useCallback(
    async ({
      replace,
      startIndex,
      signal,
      retried = false,
    }: {
      replace: boolean;
      startIndex: number;
      signal?: AbortSignal;
      retried?: boolean;
    }) => {
      const request = googleQueryFor(shelf, debouncedQuery);
      if (request.q.length === 1) return;

      setSearchError(null);
      if (replace) {
        setActionMessage(null);
        setHasMore(false);
        setReplacing(true);
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
          credentials: "same-origin",
        });
        const data = (await res.json()) as GoogleBooksPage & {
          error?: string;
          errorKey?: ErrorKey;
        };

        if (res.status === 401 && replace && !retried && !signal?.aborted) {
          await new Promise((resolve) => window.setTimeout(resolve, 400));
          if (signal?.aborted) return;
          await loadBooks({ replace, startIndex, signal, retried: true });
          return;
        }

        if (!res.ok) {
          const retryable = res.status === 429 || res.status >= 500;
          if (replace) {
            setBooks([]);
            setHasMore(false);
          } else if (!retryable) {
            setHasMore(false);
          }
          setSearchError(
            data.error ??
              (data.errorKey
                ? translateError(dictionary, data.errorKey)
                : dictionary.add.searchFailed),
          );
          return;
        }

        const next = data.books ?? [];
        if (replace) {
          setBooks(next);
          setHasMore(Boolean(data.hasMore));
        } else {
          const seen = new Set(booksRef.current.map((book) => book.id));
          const added = next.filter((book) => !seen.has(book.id));
          setBooks([...booksRef.current, ...added]);
          setHasMore(Boolean(data.hasMore) && added.length > 0);
        }
        setNextIndex(data.nextIndex);
        if (replace && next.length === 0) {
          setSearchError(dictionary.add.noResults);
        }
      } catch (error) {
        if (
          signal?.aborted ||
          (error instanceof DOMException && error.name === "AbortError")
        ) {
          return;
        }
        if (replace) setBooks([]);
        setHasMore(false);
        setSearchError(dictionary.add.searchFailed);
      } finally {
        if (!signal?.aborted) {
          setSearching(false);
          if (replace) setReplacing(false);
        }
      }
    },
    [shelf, debouncedQuery, dictionary],
  );

  useEffect(() => {
    const isDefaultBrowse =
      shelf === DEFAULT_BOOK_SHELF && debouncedQuery === "";
    if (skipNextFetch.current) {
      skipNextFetch.current = false;
      return;
    }
    if (isDefaultBrowse && skipDefaultFetch.current) {
      return;
    }
    skipDefaultFetch.current = false;

    const controller = new AbortController();
    void loadBooks({
      replace: true,
      startIndex: 0,
      signal: controller.signal,
    });
    return () => controller.abort();
  }, [shelf, debouncedQuery, loadBooks]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore || replacing) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        if (loadingMoreRef.current) return;
        loadingMoreRef.current = true;
        void loadBooks({
          replace: false,
          startIndex: nextIndexRef.current,
        }).finally(() => {
          window.setTimeout(() => {
            loadingMoreRef.current = false;
          }, 800);
        });
      },
      { root: null, rootMargin: "800px", threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, replacing, loadBooks]);

  function saveBook(book: GoogleBookResult, status: "active" | "shelved") {
    writeDiscoverCache({
      ...snapshotRef.current,
      scrollY: window.scrollY,
    });
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
      <form
        onSubmit={onSubmit}
        className="sticky top-[3.6rem] z-20 flex gap-2 bg-surface/90 py-2 backdrop-blur-xl"
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={dictionary.add.searchPlaceholder}
          className="flex-1 rounded-md border border-border bg-elevated px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted focus:border-accent/50"
        />
        <button
          type="submit"
          disabled={searching}
          className="rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-accent-fg transition hover:opacity-90 disabled:opacity-40"
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

      {searchError && !replacing ? (
        <p className="text-sm text-muted">{searchError}</p>
      ) : null}

      {replacing ? (
        <CoverSkeletonGrid
          count={10}
          className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
        />
      ) : (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {books.map((book) => (
            <li key={book.id} className="flex flex-col">
              <Link
                href={`/discover/${encodeURIComponent(book.id)}`}
                className="block"
                onClick={() =>
                  writeDiscoverCache({
                    ...snapshotRef.current,
                    scrollY: window.scrollY,
                  })
                }
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
                onClick={() =>
                  writeDiscoverCache({
                    ...snapshotRef.current,
                    scrollY: window.scrollY,
                  })
                }
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
                  className="rounded-full bg-accent px-2.5 py-1 text-[0.7rem] font-medium text-accent-fg transition hover:opacity-90 disabled:opacity-40"
                >
                  {pending && pendingId === book.id
                    ? dictionary.busy
                    : dictionary.add.addToDesk}
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => saveBook(book, "shelved")}
                  className="rounded-full border border-border px-2.5 py-1 text-[0.7rem] text-foreground/80 transition hover:border-foreground/25 disabled:opacity-40"
                >
                  {dictionary.add.addToVault}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {searching && !replacing && books.length > 0 ? (
        <CoverSkeletonGrid
          count={5}
          className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
        />
      ) : null}

      {hasMore && books.length > 0 && !replacing ? (
        <div className="flex flex-col items-center gap-3">
          <div ref={sentinelRef} className="h-8 w-full" />
          <button
            type="button"
            disabled={searching}
            onClick={() =>
              void loadBooks({
                replace: false,
                startIndex: nextIndexRef.current,
              })
            }
            className="rounded-full border border-border px-4 py-2 text-sm text-foreground/80 transition hover:border-foreground/25 hover:bg-foreground/5 disabled:opacity-40"
          >
            {searching ? dictionary.add.searching : dictionary.add.loadMore}
          </button>
        </div>
      ) : null}
    </div>
  );
}
