import { describe, expect, it } from "vitest";
import { isGoogleVolumeId } from "@/lib/catalog/google-books";

describe("isGoogleVolumeId", () => {
  it("accepts a typical volume id", () => {
    expect(isGoogleVolumeId("zyTCAlFPjgYC")).toBe(true);
  });

  it("rejects empty, spaced, or oversized ids", () => {
    expect(isGoogleVolumeId("")).toBe(false);
    expect(isGoogleVolumeId("has space")).toBe(false);
    expect(isGoogleVolumeId("a".repeat(65))).toBe(false);
  });
});
