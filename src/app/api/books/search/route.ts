import { NextResponse } from "next/server";
import type { ErrorKey } from "@/i18n/dictionaries";
import { getDictionary } from "@/i18n/get-dictionary";
import { t } from "@/i18n/t";
import { getAuthUser } from "@/lib/auth";
import {
  CATALOG_PAGE_SIZE,
  isBookSubject,
  toGoogleBooksQuery,
} from "@/lib/catalog/book-shelves";
import { GoogleBooksError, searchGoogleBooks } from "@/lib/catalog/google-books";

async function userFacingMessage(
  error: unknown,
): Promise<{ status: number; error: string; errorKey: ErrorKey }> {
  const dictionary = await getDictionary();

  if (error instanceof GoogleBooksError) {
    if (error.status === 429) {
      return {
        status: 429,
        errorKey: "booksRateLimit",
        error: dictionary.errors.booksRateLimit,
      };
    }
    if (error.status === 503 || error.status >= 500) {
      return {
        status: 503,
        errorKey: "booksUnavailable",
        error: dictionary.errors.booksUnavailable,
      };
    }
    if (error.status === 400 || error.status === 403) {
      return {
        status: 502,
        errorKey: "booksKeyRejected",
        error: dictionary.errors.booksKeyRejected,
      };
    }
    return {
      status: 502,
      errorKey: "booksFailedStatus",
      error: t(dictionary.errors.booksFailedStatus, { status: error.status }),
    };
  }

  return {
    status: 502,
    errorKey: "booksFailed",
    error: dictionary.errors.booksFailed,
  };
}

export async function GET(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    const dictionary = await getDictionary();
    return NextResponse.json(
      {
        error: dictionary.errors.authRequired,
        errorKey: "authRequired" satisfies ErrorKey,
      },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const subjectRaw = searchParams.get("subject")?.trim() ?? "";
  const subject = isBookSubject(subjectRaw) ? subjectRaw : null;
  const orderBy =
    searchParams.get("orderBy") === "newest" ? "newest" : "relevance";
  const startIndex = Number.parseInt(
    searchParams.get("startIndex") ?? "0",
    10,
  );
  const dictionary = await getDictionary();

  if (q.length === 1) {
    return NextResponse.json(
      {
        error: dictionary.errors.queryTooShort,
        errorKey: "queryTooShort" satisfies ErrorKey,
      },
      { status: 400 },
    );
  }

  try {
    const page = await searchGoogleBooks(
      toGoogleBooksQuery(q, subject),
      CATALOG_PAGE_SIZE,
      {
        orderBy: q ? "relevance" : orderBy,
        startIndex: Number.isFinite(startIndex) ? Math.max(startIndex, 0) : 0,
      },
    );
    return NextResponse.json(page);
  } catch (error) {
    const payload = await userFacingMessage(error);
    console.error("[books/search]", error);
    return NextResponse.json(
      { error: payload.error, errorKey: payload.errorKey },
      { status: payload.status },
    );
  }
}
