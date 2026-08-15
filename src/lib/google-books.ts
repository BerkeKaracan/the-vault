import { cache } from "react";
import type { Locale } from "@/i18n/config";
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
  };
};

type GoogleVolumesResponse = {
  items?: GoogleVolume[];
  error?: {
    code?: number;
    message?: string;
  };
};

const GOOGLE_VOLUME_ID = /^[A-Za-z0-9_-]{1,64}$/;

export function isGoogleVolumeId(value: string): boolean {
  return GOOGLE_VOLUME_ID.test(value);
}

function upgradeCoverUrl(url: string | undefined): string | null {
  if (!url) return null;
  return url.replace(/^http:\/\//, "https://");
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

function googleMarket(locale: Locale): {
  country: string;
  acceptLanguage: string;
} {
  if (locale === "tr") {
    return { country: "TR", acceptLanguage: "tr-TR,tr;q=0.9,en;q=0.4" };
  }
  return { country: "US", acceptLanguage: "en-US,en;q=0.9,tr;q=0.3" };
}

async function fetchVolumes(
  query: string,
  limit: number,
  locale: Locale,
  apiKey?: string,
): Promise<GoogleBookResult[]> {
  const market = googleMarket(locale);
  const params = new URLSearchParams({
    q: query,
    maxResults: String(Math.min(Math.max(limit, 1), 40)),
    printType: "books",
    country: market.country,
  });

  if (apiKey) {
    params.set("key", apiKey);
  }

  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?${params.toString()}`,
    {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Accept-Language": market.acceptLanguage,
      },
    },
  );

  const data = await readGoogleJson<GoogleVolumesResponse>(res);
  throwIfGoogleError(res, data);
  return mapVolumes(data);
}

async function fetchVolume(
  id: string,
  locale: Locale,
  apiKey?: string,
): Promise<GoogleBookResult | null> {
  const market = googleMarket(locale);
  const params = new URLSearchParams({
    country: market.country,
  });
  if (apiKey) params.set("key", apiKey);

  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes/${encodeURIComponent(id)}?${params.toString()}`,
    {
      next: { revalidate: 60 * 60 * 24 },
      headers: {
        Accept: "application/json",
        "Accept-Language": market.acceptLanguage,
      },
    },
  );

  if (res.status === 404) return null;

  const data = await readGoogleJson<
    GoogleVolume & { error?: { code?: number; message?: string } }
  >(res);
  throwIfGoogleError(res, data);
  return mapVolume(data);
}

async function withRetry<T>(run: () => Promise<T>): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await run();
    } catch (error) {
      lastError = error;
      const retryable =
        error instanceof GoogleBooksError &&
        (error.status === 503 || error.status === 429 || error.status >= 500);

      if (!retryable || attempt === 2) {
        throw error;
      }

      await sleep(400 * (attempt + 1));
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
  limit = 12,
  locale: Locale = "tr",
): Promise<GoogleBookResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  return withOptionalKey((apiKey) =>
    fetchVolumes(trimmed, limit, locale, apiKey),
  );
}

export const getGoogleBook = cache(
  async (
    id: string,
    locale: Locale = "tr",
  ): Promise<GoogleBookResult | null> => {
    if (!isGoogleVolumeId(id)) return null;
    return withOptionalKey((apiKey) => fetchVolume(id, locale, apiKey));
  },
);
