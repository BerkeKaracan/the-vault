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
/** Default vitrine is fiction — Google Books has no true newest-all feed. */
export const BROWSE_ALL_QUERY = "subject:fiction";
export const CATALOG_PAGE_SIZE = 24;

const SUBJECTS = new Set(
  BOOK_SHELVES.map((shelf) => shelf.subject).filter(
    (subject): subject is string => subject !== null,
  ),
);

export function isBookSubject(value: string): boolean {
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

  if (subject) {
    return { q: "", subject, orderBy: "newest" };
  }

  return { q: "", subject: null, orderBy: "newest" };
}

export function toGoogleBooksQuery(q: string, subject: string | null): string {
  const trimmed = q.trim();
  if (trimmed && subject) return `${trimmed} subject:${subject}`;
  if (trimmed) return trimmed;
  if (subject) return `subject:${subject}`;
  return BROWSE_ALL_QUERY;
}
