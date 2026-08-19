import { describe, expect, it } from "vitest";
import { t } from "@/i18n/t";

describe("t", () => {
  it("returns the template when there are no vars", () => {
    expect(t("{count} gün")).toBe("{count} gün");
  });

  it("replaces every placeholder", () => {
    expect(t("{count} gün · {pages} sayfa", { count: 3, pages: 40 })).toBe(
      "3 gün · 40 sayfa",
    );
  });
});
