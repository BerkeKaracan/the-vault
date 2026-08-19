import { cache } from "react";
import type { Locale } from "@/i18n/config";
import { getLocale } from "@/i18n/get-dictionary";
import {
  BROWSE_ALL_QUERY,
  CATALOG_INDEX_CAP,
  CATALOG_PAGE_SIZE,
  catalogHasMore,
} from "@/lib/catalog/book-shelves";
import { cleanBookDescription } from "@/lib/text";

export type GoogleBookResult = {
  id: string;
  title: string;
  authors: string[];
  pageCount: number | null;
  coverUrl: string | null;
  description: string | null;
  publishedDate: string | null;
  publisher: string | null;
  categories: string[];
  language: string | null;
  isbn: string | null;
};

export class GoogleBooksError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "GoogleBooksError";
    this.status = status;
  }
}

type ImageLinks = {
  extraLarge?: string;
  large?: string;
  medium?: string;
  small?: string;
  thumbnail?: string;
  smallThumbnail?: string;
};

type IndustryIdentifier = {
  type?: string;
  identifier?: string;
};

type GoogleVolume = {
  id: string;
  volumeInfo?: {
    title?: string;
    authors?: string[];
    pageCount?: number;
    description?: string;
    publishedDate?: string;
    publisher?: string;
    categories?: string[];
    language?: string;
    imageLinks?: ImageLinks;
    industryIdentifiers?: IndustryIdentifier[];
  };
};

type GoogleVolumesResponse = {
  items?: GoogleVolume[];
  totalItems?: number;
  error?: {
    code?: number;
    message?: string;
  };
};

export type GoogleBooksPage = {
  books: GoogleBookResult[];
  totalItems: number;
  startIndex: number;
  nextIndex: number;
  hasMore: boolean;
};

const GOOGLE_VOLUME_ID = /^[A-Za-z0-9_-]{1,64}$/;

export function isGoogleVolumeId(value: string): boolean {
  return GOOGLE_VOLUME_ID.test(value);
}

function upgradeCoverUrl(url: string | undefined): string | null {
  if (!url) return null;
  return url.replace(/^http:\/\//, "https://");
}

function pickIsbn(info: GoogleVolume["volumeInfo"]): string | null {
  const ids = info?.industryIdentifiers ?? [];
  const isbn13 = ids.find((item) => item.type === "ISBN_13")?.identifier;
  const isbn10 = ids.find((item) => item.type === "ISBN_10")?.identifier;
  const value = isbn13 ?? isbn10 ?? null;
  return value?.trim() || null;
}

function queryToken(value: string): string {
  return value
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function pickCover(links: ImageLinks | undefined): string | null {
  if (!links) return null;
  return upgradeCoverUrl(
    links.extraLarge ??
      links.large ??
      links.medium ??
      links.small ??
      links.thumbnail ??
      links.smallThumbnail,
  );
}

function mapVolume(item: GoogleVolume): GoogleBookResult | null {
  const info = item.volumeInfo;
  if (!info?.title) return null;

  return {
    id: item.id,
    title: info.title,
    authors: info.authors ?? [],
    pageCount: info.pageCount ?? null,
    coverUrl: pickCover(info.imageLinks),
    description: info.description
      ? cleanBookDescription(info.description) || null
      : null,
    publishedDate: info.publishedDate ?? null,
    publisher: info.publisher ?? null,
    categories: info.categories ?? [],
    language: info.language ?? null,
    isbn: pickIsbn(info),
  };
}

function mapVolumes(data: GoogleVolumesResponse): GoogleBookResult[] {
  return (data.items ?? [])
    .map(mapVolume)
    .filter((item): item is GoogleBookResult => item !== null);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function readGoogleJson<T>(res: Response): Promise<T> {
  try {
    return (await res.json()) as T;
  } catch {
    throw new GoogleBooksError(res.status, `Google Books error: ${res.status}`);
  }
}

function throwIfGoogleError(
  res: Response,
  data: { error?: { code?: number; message?: string } },
) {
  if (!res.ok || data.error) {
    const status = data.error?.code ?? res.status;
    const message = data.error?.message ?? `Google Books error: ${status}`;
    throw new GoogleBooksError(status, message);
  }
}

/** Default catalog is English Google Books, not the TR storefront. */
const GOOGLE_MARKET = {
  country: "US",
  hl: "en",
  acceptLanguage: "en-US,en;q=0.9",
} as const;

const TURKISH_BLURB_MARKET = {
  country: "TR",
  hl: "tr",
  acceptLanguage: "tr-TR,tr;q=0.9,en;q=0.8",
} as const;

export type GoogleBooksSearchOptions = {
  orderBy?: "relevance" | "newest";
  startIndex?: number;
  langRestrict?: string;
  revalidateSeconds?: number;
  market?: {
    country: string;
    acceptLanguage: string;
  };
};

const EMPTY_PAGE: GoogleBooksPage = {
  books: [],
  totalItems: 0,
  startIndex: 0,
  nextIndex: 0,
  hasMore: false,
};

const FETCH_TIMEOUT_MS = 8_000;

function toBooksPage(
  data: GoogleVolumesResponse,
  startIndex: number,
): GoogleBooksPage {
  const rawCount = data.items?.length ?? 0;
  const totalItems = Math.max(0, data.totalItems ?? 0);
  const nextIndex = startIndex + rawCount;
  return {
    books: mapVolumes(data),
    totalItems,
    startIndex,
    nextIndex,
    hasMore: catalogHasMore(rawCount, nextIndex),
  };
}

async function fetchVolumes(
  query: string,
  limit: number,
  apiKey?: string,
  options?: GoogleBooksSearchOptions,
): Promise<GoogleBooksPage> {
  const startIndex = Math.max(options?.startIndex ?? 0, 0);
  const market = options?.market ?? GOOGLE_MARKET;
  const params = new URLSearchParams({
    q: query,
    maxResults: String(Math.min(Math.max(limit, 1), 40)),
    printType: "books",
    country: market.country,
    orderBy: options?.orderBy === "newest" ? "newest" : "relevance",
    startIndex: String(startIndex),
  });

  if (options?.langRestrict) {
    params.set("langRestrict", options.langRestrict);
  }
  if (apiKey) {
    params.set("key", apiKey);
  }

  const revalidate = options?.revalidateSeconds;
  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?${params.toString()}`,
    {
      ...(revalidate != null
        ? { next: { revalidate } }
        : { cache: "no-store" as const }),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: {
        Accept: "application/json",
        "Accept-Language": market.acceptLanguage,
      },
    },
  );

  const data = await readGoogleJson<GoogleVolumesResponse>(res);
  throwIfGoogleError(res, data);
  return toBooksPage(data, startIndex);
}

async function findTurkishBlurb(
  book: GoogleBookResult,
  apiKey?: string,
): Promise<Pick<GoogleBookResult, "description" | "categories"> | null> {
  if (book.language === "tr" && book.description) return null;
  if (book.description && /[çğıöşüÇĞİÖŞÜ]/.test(book.description)) return null;

  const queries: string[] = [];
  const title = queryToken(book.title);
  const author = queryToken(book.authors[0] ?? "");
  if (title && author) {
    queries.push(`intitle:${title} inauthor:${author}`);
  } else if (title) {
    queries.push(`intitle:${title}`);
  }
  if (book.isbn) queries.push(`isbn:${book.isbn}`);

  const needle = title.toLocaleLowerCase("tr");

  for (const query of queries) {
    try {
      const page = await fetchVolumes(query, 8, apiKey, {
        langRestrict: "tr",
        revalidateSeconds: 60 * 60 * 24,
        market: TURKISH_BLURB_MARKET,
      });
      const match = page.books.find((item) => {
        if (item.language !== "tr" || !item.description) return false;
        const candidate = queryToken(item.title).toLocaleLowerCase("tr");
        return (
          !needle ||
          candidate === needle ||
          candidate.includes(needle) ||
          needle.includes(candidate)
        );
      });
      if (match?.description) {
        return {
          description: match.description,
          categories:
            match.categories.length > 0 ? match.categories : book.categories,
        };
      }
    } catch {
      /* keep original blurb */
    }
  }

  return null;
}

async function fetchVolume(
  id: string,
  apiKey: string | undefined,
  locale: Locale,
): Promise<GoogleBookResult | null> {
  const params = new URLSearchParams({
    country: GOOGLE_MARKET.country,
    hl: GOOGLE_MARKET.hl,
  });
  if (apiKey) params.set("key", apiKey);

  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes/${encodeURIComponent(id)}?${params.toString()}`,
    {
      next: { revalidate: 60 * 60 * 24 },
      headers: {
        Accept: "application/json",
        "Accept-Language": GOOGLE_MARKET.acceptLanguage,
      },
    },
  );

  if (res.status === 404) return null;

  const data = await readGoogleJson<
    GoogleVolume & { error?: { code?: number; message?: string } }
  >(res);
  throwIfGoogleError(res, data);
  const book = mapVolume(data);
  if (!book) return null;
  if (locale !== "tr") return book;

  const turkish = await findTurkishBlurb(book, apiKey);
  if (!turkish) return book;
  return {
    ...book,
    description: turkish.description,
    categories: turkish.categories,
  };
}

async function withRetry<T>(run: () => Promise<T>): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await run();
    } catch (error) {
      lastError = error;
      const retryable =
        (error instanceof GoogleBooksError &&
          (error.status === 503 ||
            error.status === 429 ||
            error.status >= 500)) ||
        (error instanceof Error &&
          (error.name === "TimeoutError" || error.name === "AbortError"));

      if (!retryable || attempt === 2) {
        throw error;
      }

      const heavy =
        error instanceof GoogleBooksError &&
        (error.status === 503 || error.status === 429 || error.status >= 500);
      await sleep((heavy ? 900 : 400) * (attempt + 1));
    }
  }

  throw lastError;
}

async function withOptionalKey<T>(
  run: (apiKey?: string) => Promise<T>,
): Promise<T> {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY?.trim();

  try {
    return await withRetry(() => run(apiKey || undefined));
  } catch (error) {
    if (
      apiKey &&
      error instanceof GoogleBooksError &&
      (error.status === 400 || error.status === 403)
    ) {
      return await withRetry(() => run(undefined));
    }
    throw error;
  }
}

export async function searchGoogleBooks(
  query: string,
  limit = CATALOG_PAGE_SIZE,
  options?: GoogleBooksSearchOptions,
): Promise<GoogleBooksPage> {
  const trimmed = query.trim();
  const startIndex = Math.max(options?.startIndex ?? 0, 0);
  if (!trimmed || startIndex >= CATALOG_INDEX_CAP) {
    return { ...EMPTY_PAGE, startIndex, nextIndex: startIndex };
  }
  return withOptionalKey((apiKey) =>
    fetchVolumes(trimmed, limit, apiKey, options),
  );
}

/**
 * Discover vitrine. Not wrapped in unstable_cache: an empty Google hit
 * (common on the first request) would otherwise stick for minutes, and
 * `cache: "no-store"` inside that wrapper also prevented a real cache.
 * Search stays on the client `/api/books/search` path.
 */
export async function getBrowseCatalogPage(): Promise<GoogleBooksPage> {
  try {
    const page = await searchGoogleBooks(BROWSE_ALL_QUERY, CATALOG_PAGE_SIZE, {
      orderBy: "relevance",
    });
    if (page.books.length > 0) return page;
    await sleep(300);
    return await searchGoogleBooks(BROWSE_ALL_QUERY, CATALOG_PAGE_SIZE, {
      orderBy: "relevance",
    });
  } catch {
    return EMPTY_PAGE;
  }
}

const loadGoogleBook = cache(
  async (id: string, locale: Locale): Promise<GoogleBookResult | null> => {
    if (!isGoogleVolumeId(id)) return null;
    return withOptionalKey((apiKey) => fetchVolume(id, apiKey, locale));
  },
);

export async function getGoogleBook(
  id: string,
): Promise<GoogleBookResult | null> {
  if (!isGoogleVolumeId(id)) return null;
  const locale = await getLocale();
  return loadGoogleBook(id, locale);
}
