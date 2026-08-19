import { describe, expect, it } from "vitest";
import {
  BROWSE_ALL_QUERY,
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

  it("browses a shelf by newest subject", () => {
    expect(googleQueryFor("history", "")).toEqual({
      q: "",
      subject: "history",
      orderBy: "newest",
    });
  });

  it("browses the default all shelf without a subject", () => {
    expect(googleQueryFor("all", "")).toEqual({
      q: "",
      subject: null,
      orderBy: "newest",
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

describe("isBookSubject", () => {
  it("accepts catalog subjects and rejects all", () => {
    expect(isBookSubject("fiction")).toBe(true);
    expect(isBookSubject("all")).toBe(false);
    expect(isBookSubject("")).toBe(false);
  });
});
