import { describe, expect, it } from "vitest";
import {
  isAccentColor,
  isMetricType,
  parseTags,
  tagTone,
} from "@/lib/catalog/fields";

describe("isMetricType", () => {
  it("accepts the three vault metrics", () => {
    expect(isMetricType("pages")).toBe(true);
    expect(isMetricType("questions")).toBe(true);
    expect(isMetricType("chapters")).toBe(true);
    expect(isMetricType("words")).toBe(false);
  });
});

describe("isAccentColor", () => {
  it("accepts theme accents", () => {
    expect(isAccentColor("emerald")).toBe(true);
    expect(isAccentColor("red")).toBe(false);
  });
});

describe("parseTags", () => {
  it("trims, dedupes case-insensitively, and caps at eight", () => {
    expect(parseTags(" Roman , roman ; Essay,, ")).toEqual(["Roman", "Essay"]);
    expect(parseTags("a,b,c,d,e,f,g,h,i")).toEqual([
      "a",
      "b",
      "c",
      "d",
      "e",
      "f",
      "g",
      "h",
    ]);
  });

  it("truncates each tag to 24 characters", () => {
    expect(parseTags("abcdefghijklmnopqrstuvwxyz")).toEqual([
      "abcdefghijklmnopqrstuvwx",
    ]);
  });
});

describe("tagTone", () => {
  it("is stable for the same tag", () => {
    expect(tagTone("history")).toBe(tagTone("history"));
  });
});
