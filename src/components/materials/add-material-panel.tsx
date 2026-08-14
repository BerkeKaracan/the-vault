"use client";

import { useState, useTransition } from "react";
import { addMaterial } from "@/app/(app)/materials-actions";
import { Cover } from "@/components/materials/cover";
import type { ErrorKey } from "@/i18n/dictionaries";
import { useI18n } from "@/i18n/provider";
import { t } from "@/i18n/t";
import type { GoogleBookResult } from "@/lib/google-books";

type Tab = "search" | "manual";

function translateError(
  dictionary: ReturnType<typeof useI18n>["dictionary"],
  code: string,
) {
  if (code in dictionary.errors) {
    return dictionary.errors[code as ErrorKey];
  }
  return code;
}

export function AddMaterialPanel() {
  const { dictionary } = useI18n();
  const [tab, setTab] = useState<Tab>("search");
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState<GoogleBookResult[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [pending, startTransition] = useTransition();

  async function runSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchError(null);
    setActionMessage(null);
    setSearching(true);
    try {
      const res = await fetch(
        `/api/books/search?q=${encodeURIComponent(query.trim())}`,
      );
      const data = (await res.json()) as {
        books?: GoogleBookResult[];
        error?: string;
        errorKey?: ErrorKey;
      };
      if (!res.ok) {
        setBooks([]);
        // Prefer server-localized message (already interpolated).
        setSearchError(
          data.error ??
            (data.errorKey
              ? translateError(dictionary, data.errorKey)
              : dictionary.add.searchFailed),
        );
        return;
      }
      setBooks(data.books ?? []);
      if ((data.books ?? []).length === 0) {
        setSearchError(dictionary.add.noResults);
      }
    } catch {
      setSearchError(dictionary.add.searchFailed);
      setBooks([]);
    } finally {
      setSearching(false);
    }
  }

  function saveBook(book: GoogleBookResult, status: "active" | "shelved") {
    setActionMessage(null);
    startTransition(async () => {
      const result = await addMaterial({
        title: book.title,
        author: book.authors.join(", ") || null,
        totalPages: book.pageCount,
        coverUrl: book.coverUrl,
        googleBooksId: book.id,
        source: "google",
        status,
      });
      if (!result.ok) {
        setActionMessage(translateError(dictionary, result.error));
        return;
      }
      setActionMessage(
        status === "active"
          ? t(dictionary.add.addedToDesk, { title: book.title })
          : t(dictionary.add.addedToVault, { title: book.title }),
      );
    });
  }

  function saveManual(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setActionMessage(null);
    const form = new FormData(e.currentTarget);
    const title = String(form.get("title") ?? "");
    const author = String(form.get("author") ?? "");
    const totalRaw = String(form.get("totalPages") ?? "").trim();
    const status = String(form.get("status") ?? "shelved") as
      | "active"
      | "shelved";
    const totalPages = totalRaw ? Number(totalRaw) : null;

    startTransition(async () => {
      const result = await addMaterial({
        title,
        author: author || null,
        totalPages:
          totalPages && Number.isFinite(totalPages) && totalPages > 0
            ? totalPages
            : null,
        coverUrl: null,
        googleBooksId: null,
        source: "custom",
        status,
      });
      if (!result.ok) {
        setActionMessage(translateError(dictionary, result.error));
        return;
      }
      setActionMessage(t(dictionary.add.added, { title: title.trim() }));
      e.currentTarget.reset();
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex gap-4 border-b border-zinc-900 text-sm">
        <button
          type="button"
          onClick={() => setTab("search")}
          className={`pb-3 transition ${
            tab === "search"
              ? "border-b border-zinc-100 text-zinc-100"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          {dictionary.add.tabSearch}
        </button>
        <button
          type="button"
          onClick={() => setTab("manual")}
          className={`pb-3 transition ${
            tab === "manual"
              ? "border-b border-zinc-100 text-zinc-100"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          {dictionary.add.tabManual}
        </button>
      </div>

      {actionMessage ? (
        <output className="rounded-md border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-300">
          {actionMessage}
        </output>
      ) : null}

      {tab === "search" ? (
        <div className="flex flex-col gap-6">
          <form onSubmit={runSearch} className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={dictionary.add.searchPlaceholder}
              className="flex-1 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-zinc-600"
            />
            <button
              type="submit"
              disabled={searching || query.trim().length < 2}
              className="rounded-md bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-white disabled:opacity-40"
            >
              {searching ? dictionary.add.searching : dictionary.add.search}
            </button>
          </form>

          {searchError ? (
            <p className="text-sm text-zinc-500">{searchError}</p>
          ) : null}

          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {books.map((book) => (
              <li
                key={book.id}
                className="flex gap-4 rounded-lg border border-zinc-900 bg-zinc-950/40 p-3"
              >
                <div className="w-20 shrink-0">
                  <Cover
                    title={book.title}
                    author={book.authors.join(", ")}
                    coverUrl={book.coverUrl}
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="truncate font-medium text-zinc-100">
                    {book.title}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-zinc-500">
                    {book.authors.join(", ") || dictionary.add.noAuthor}
                  </p>
                  <p className="mt-1 font-mono text-xs text-zinc-600">
                    {book.pageCount
                      ? t(dictionary.add.pages, { count: book.pageCount })
                      : dictionary.add.pagesUnknown}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-2 pt-3">
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => saveBook(book, "active")}
                      className="rounded-md bg-zinc-100 px-2.5 py-1.5 text-xs font-medium text-zinc-950 disabled:opacity-40"
                    >
                      {dictionary.add.addToDesk}
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => saveBook(book, "shelved")}
                      className="rounded-md border border-zinc-800 px-2.5 py-1.5 text-xs text-zinc-300 hover:border-zinc-600 disabled:opacity-40"
                    >
                      {dictionary.add.addToVault}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <form onSubmit={saveManual} className="flex max-w-md flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm text-zinc-400">
            {dictionary.add.titleLabel}
            <input
              name="title"
              required
              className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-zinc-600"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-zinc-400">
            {dictionary.add.authorLabel}
            <input
              name="author"
              className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-zinc-600"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-zinc-400">
            {dictionary.add.totalPagesLabel}
            <input
              name="totalPages"
              type="number"
              min={1}
              className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-zinc-600"
            />
          </label>
          <fieldset className="flex gap-4 text-sm text-zinc-400">
            <label className="flex items-center gap-2">
              <input type="radio" name="status" value="active" defaultChecked />
              {dictionary.add.statusActive}
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="status" value="shelved" />
              {dictionary.add.statusVault}
            </label>
          </fieldset>
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-950 disabled:opacity-40"
          >
            {pending ? "…" : dictionary.add.submit}
          </button>
        </form>
      )}
    </div>
  );
}
