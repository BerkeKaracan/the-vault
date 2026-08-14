export type GoogleBookResult = {
  id: string;
  title: string;
  authors: string[];
  pageCount: number | null;
  coverUrl: string | null;
};

export class GoogleBooksError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "GoogleBooksError";
    this.status = status;
  }
}

type GoogleVolume = {
  id: string;
  volumeInfo?: {
    title?: string;
    authors?: string[];
    pageCount?: number;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
  };
};

type GoogleVolumesResponse = {
  items?: GoogleVolume[];
  error?: {
    code?: number;
    message?: string;
  };
};

function upgradeCoverUrl(url: string | undefined): string | null {
  if (!url) return null;
  return url.replace(/^http:\/\//, "https://");
}

function mapVolumes(data: GoogleVolumesResponse): GoogleBookResult[] {
  return (data.items ?? [])
    .map((item) => {
      const info = item.volumeInfo;
      if (!info?.title) return null;

      return {
        id: item.id,
        title: info.title,
        authors: info.authors ?? [],
        pageCount: info.pageCount ?? null,
        coverUrl: upgradeCoverUrl(
          info.imageLinks?.thumbnail ?? info.imageLinks?.smallThumbnail,
        ),
      } satisfies GoogleBookResult;
    })
    .filter((item): item is GoogleBookResult => item !== null);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchVolumes(
  query: string,
  limit: number,
  apiKey?: string,
): Promise<GoogleBookResult[]> {
  const params = new URLSearchParams({
    q: query,
    maxResults: String(Math.min(Math.max(limit, 1), 40)),
    printType: "books",
  });

  if (apiKey) {
    params.set("key", apiKey);
  }

  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?${params.toString()}`,
    {
      cache: "no-store",
      headers: { Accept: "application/json" },
    },
  );

  let data: GoogleVolumesResponse;
  try {
    data = (await res.json()) as GoogleVolumesResponse;
  } catch {
    throw new GoogleBooksError(res.status, `Google Books error: ${res.status}`);
  }

  if (!res.ok || data.error) {
    const status = data.error?.code ?? res.status;
    const message = data.error?.message ?? `Google Books error: ${status}`;
    throw new GoogleBooksError(status, message);
  }

  return mapVolumes(data);
}

async function fetchVolumesWithRetry(
  query: string,
  limit: number,
  apiKey?: string,
): Promise<GoogleBookResult[]> {
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await fetchVolumes(query, limit, apiKey);
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

export async function searchGoogleBooks(
  query: string,
  limit = 12,
): Promise<GoogleBookResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const apiKey = process.env.GOOGLE_BOOKS_API_KEY?.trim();

  try {
    return await fetchVolumesWithRetry(trimmed, limit, apiKey || undefined);
  } catch (error) {
    // Invalid / misconfigured key → retry once without key
    if (
      apiKey &&
      error instanceof GoogleBooksError &&
      (error.status === 400 || error.status === 403)
    ) {
      return await fetchVolumesWithRetry(trimmed, limit);
    }
    throw error;
  }
}
