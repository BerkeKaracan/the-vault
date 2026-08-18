import { describe, expect, it } from "vitest";
import { googleQueryFor } from "@/lib/catalog/book-shelves";

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
