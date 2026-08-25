import { afterEach, describe, expect, it, vi } from "vitest";
import {
  clearDiscoverCache,
  readDiscoverCache,
  writeDiscoverCache,
  type DiscoverCache,
} from "@/lib/list-session";

const sampleBook = {
  id: "abc",
  title: "Test",
  authors: ["Author"],
  pageCount: 10,
  coverUrl: null,
  description: null,
  publishedDate: null,
  publisher: null,
  categories: [],
  language: "en",
  isbn: null,
};

function cache(books: DiscoverCache["books"]): DiscoverCache {
  return {
    shelf: "all",
    query: "",
    books,
    nextIndex: books.length,
    hasMore: true,
    scrollY: 0,
  };
}

describe("discover session cache", () => {
  afterEach(() => {
    clearDiscoverCache();
    vi.unstubAllGlobals();
  });

  it("round-trips a non-empty catalog", () => {
    const store = new Map<string, string>();
    vi.stubGlobal("sessionStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
    });

    writeDiscoverCache(cache([sampleBook]));
    expect(readDiscoverCache()?.books).toHaveLength(1);
  });

  it("does not persist or restore an empty catalog", () => {
    const store = new Map<string, string>();
    vi.stubGlobal("sessionStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
    });

    writeDiscoverCache(cache([sampleBook]));
    writeDiscoverCache(cache([]));
    expect(readDiscoverCache()).toBeNull();

    store.set(
      "vault:discover:v4",
      JSON.stringify(cache([])),
    );
    expect(readDiscoverCache()).toBeNull();
  });
});
