import { describe, expect, it } from "vitest";
import { isColorScheme } from "@/lib/theme";

describe("isColorScheme", () => {
  it("accepts dark and light only", () => {
    expect(isColorScheme("dark")).toBe(true);
    expect(isColorScheme("light")).toBe(true);
    expect(isColorScheme("system")).toBe(false);
    expect(isColorScheme(null)).toBe(false);
  });
});
