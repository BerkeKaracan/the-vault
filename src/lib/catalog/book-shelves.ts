export const BOOK_SHELVES = [
  { id: "all", subject: null },
  { id: "fiction", subject: "fiction" },
  { id: "history", subject: "history" },
  { id: "science", subject: "science" },
  { id: "philosophy", subject: "philosophy" },
  { id: "psychology", subject: "psychology" },
  { id: "business", subject: "business" },
  { id: "computers", subject: "computers" },
  { id: "poetry", subject: "poetry" },
  { id: "biography", subject: "biography" },
] as const;

export type BookShelfId = (typeof BOOK_SHELVES)[number]["id"];

export const DEFAULT_BOOK_SHELF: BookShelfId = "all";
/** Default vitrine: fiction by relevance (no likes feed; Google has no true all-newest). */
export const BROWSE_ALL_QUERY = "subject:fiction";
/** Google Books maxResults ceiling. */
export const CATALOG_PAGE_SIZE = 40;
/** Volumes list is only useful through the first thousand hits. */
export const CATALOG_INDEX_CAP = 1000;

export type BookSubject = Exclude<
  (typeof BOOK_SHELVES)[number]["subject"],
  null
>;

const SUBJECTS = new Set<string>(
  BOOK_SHELVES.flatMap((shelf) => (shelf.subject ? [shelf.subject] : [])),
);

export function isBookSubject(value: string): value is BookSubject {
  return SUBJECTS.has(value);
}

export function googleQueryFor(
  shelfId: BookShelfId,
  search: string,
): { q: string; subject: string | null; orderBy: "newest" | "relevance" } {
  const shelf = BOOK_SHELVES.find((item) => item.id === shelfId);
  const subject = shelf?.subject ?? null;
  const trimmed = search.trim();

  if (trimmed) {
    return { q: trimmed, subject, orderBy: "relevance" };
  }

  if (!subject) {
    return { q: BROWSE_ALL_QUERY, subject: null, orderBy: "relevance" };
  }

  return { q: "", subject, orderBy: "relevance" };
}

/** Keep paging until Google returns an empty page or the index cap. */
export function catalogHasMore(rawCount: number, nextIndex: number): boolean {
  return rawCount > 0 && nextIndex < CATALOG_INDEX_CAP;
}

export function toGoogleBooksQuery(q: string, subject: string | null): string {
  const trimmed = q.trim();
  if (trimmed && subject) return `${trimmed} subject:${subject}`;
  if (trimmed) return trimmed;
  if (subject) return `subject:${subject}`;
  return BROWSE_ALL_QUERY;
}
