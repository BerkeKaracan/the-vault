import { BOOK_SHELVES, type BookShelfId } from "@/lib/catalog/book-shelves";
import type { GoogleBookResult } from "@/lib/catalog/google-books";

const DISCOVER_KEY = "vault:discover:v4";
const LIBRARY_SCROLL_KEY = "vault:library:scrollY";

export type DiscoverCache = {
  shelf: BookShelfId;
  query: string;
  books: GoogleBookResult[];
  nextIndex: number;
  hasMore: boolean;
  scrollY: number;
};

function isBookShelfId(value: unknown): value is BookShelfId {
  return (
    typeof value === "string" &&
    BOOK_SHELVES.some((shelf) => shelf.id === value)
  );
}

function isBook(value: unknown): value is GoogleBookResult {
  if (!value || typeof value !== "object") return false;
  const book = value as GoogleBookResult;
  return (
    typeof book.id === "string" &&
    typeof book.title === "string" &&
    Array.isArray(book.authors)
  );
}

export function readDiscoverCache(): DiscoverCache | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(DISCOVER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DiscoverCache>;
    if (!isBookShelfId(parsed.shelf) || typeof parsed.query !== "string") {
      return null;
    }
    if (!Array.isArray(parsed.books) || !parsed.books.every(isBook)) {
      return null;
    }
    if (
      typeof parsed.nextIndex !== "number" ||
      typeof parsed.hasMore !== "boolean" ||
      typeof parsed.scrollY !== "number"
    ) {
      return null;
    }
    return {
      shelf: parsed.shelf,
      query: parsed.query,
      books: parsed.books,
      nextIndex: parsed.nextIndex,
      hasMore: parsed.hasMore,
      scrollY: parsed.scrollY,
    };
  } catch {
    return null;
  }
}

export function writeDiscoverCache(cache: DiscoverCache) {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(DISCOVER_KEY, JSON.stringify(cache));
  } catch {
    /* quota / private mode */
  }
}

export function readLibraryScroll(): number | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(LIBRARY_SCROLL_KEY);
    if (!raw) return null;
    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

export function restoreWindowScroll(top: number) {
  if (!Number.isFinite(top) || top < 0) return;
  const root = document.documentElement;
  const previous = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  window.scrollTo({ top, left: 0, behavior: "instant" });
  root.style.scrollBehavior = previous;
}

export function writeLibraryScroll(scrollY: number) {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(LIBRARY_SCROLL_KEY, String(scrollY));
  } catch {
    /* quota / private mode */
  }
}
