import { describe, expect, it } from "vitest";
import {
  BROWSE_ALL_QUERY,
  CATALOG_INDEX_CAP,
  catalogHasMore,
  googleQueryFor,
  isBookSubject,
  toGoogleBooksQuery,
} from "@/lib/catalog/book-shelves";

describe("googleQueryFor", () => {
  it("uses the typed search with relevance", () => {
    expect(googleQueryFor("fiction", "  Woolf ")).toEqual({
      q: "Woolf",
      subject: "fiction",
      orderBy: "relevance",
    });
  });

  it("browses a shelf by relevance", () => {
    expect(googleQueryFor("history", "")).toEqual({
      q: "",
      subject: "history",
      orderBy: "relevance",
    });
  });

  it("browses the default all shelf as the fiction vitrine", () => {
    expect(googleQueryFor("all", "")).toEqual({
      q: BROWSE_ALL_QUERY,
      subject: null,
      orderBy: "relevance",
    });
  });
});

describe("toGoogleBooksQuery", () => {
  it("combines a search with a subject filter", () => {
    expect(toGoogleBooksQuery("Woolf", "fiction")).toBe(
      "Woolf subject:fiction",
    );
  });

  it("uses the fiction vitrine when browsing all", () => {
    expect(toGoogleBooksQuery("", null)).toBe(BROWSE_ALL_QUERY);
    expect(toGoogleBooksQuery("  ", null)).toBe(BROWSE_ALL_QUERY);
  });

  it("passes through a lone query or subject", () => {
    expect(toGoogleBooksQuery("Socrates", null)).toBe("Socrates");
    expect(toGoogleBooksQuery("", "history")).toBe("subject:history");
  });
});

describe("catalogHasMore", () => {
  it("keeps paging after a short page and stops on empty", () => {
    expect(catalogHasMore(12, 12)).toBe(true);
    expect(catalogHasMore(40, 40)).toBe(true);
    expect(catalogHasMore(0, 40)).toBe(false);
    expect(catalogHasMore(40, CATALOG_INDEX_CAP)).toBe(false);
  });
});

describe("isBookSubject", () => {
  it("accepts catalog subjects and rejects all", () => {
    expect(isBookSubject("fiction")).toBe(true);
    expect(isBookSubject("all")).toBe(false);
    expect(isBookSubject("")).toBe(false);
  });
});
