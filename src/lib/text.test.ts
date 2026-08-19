import { describe, expect, it } from "vitest";
import {
  cleanBookDescription,
  descriptionParagraphs,
  snippet,
} from "@/lib/text";

describe("cleanBookDescription", () => {
  it("strips tags, decodes entities, and drops shop hashtags", () => {
    expect(
      cleanBookDescription(
        "<p>A tale of &amp; time.</p><p>#mustread #booktok</p>",
      ),
    ).toBe("A tale of & time.");
  });

  it("turns paragraph tags into separate blocks", () => {
    expect(cleanBookDescription("One</p>Two")).toBe("One\n\nTwo");
  });
});

describe("descriptionParagraphs", () => {
  it("returns an empty list for blank copy", () => {
    expect(descriptionParagraphs(null)).toEqual([]);
    expect(descriptionParagraphs("   ")).toEqual([]);
  });

  it("splits cleaned paragraphs", () => {
    expect(descriptionParagraphs("<p>First</p><p>Second</p>")).toEqual([
      "First",
      "Second",
    ]);
  });
});

describe("snippet", () => {
  it("keeps short text and ellipsizes long text", () => {
    expect(snippet("Short blurb")).toBe("Short blurb");
    expect(snippet("abcdefghij", 8)).toBe("abcdefgh…");
  });
});
