import { describe, expect, it } from "vitest";
import { isUuid } from "@/lib/ids";

describe("isUuid", () => {
  it("accepts a v4 UUID", () => {
    expect(isUuid("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
  });

  it("rejects empty, short, and non-hex values", () => {
    expect(isUuid("")).toBe(false);
    expect(isUuid("not-a-uuid")).toBe(false);
    expect(isUuid("550e8400e29b41d4a716446655440000")).toBe(false);
  });
});
