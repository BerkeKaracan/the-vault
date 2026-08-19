import { describe, expect, it } from "vitest";
import {
  addSignedDayEntry,
  applyProgressToHeatmap,
  signedDayEntries,
  signedDeltaLabel,
  signedEntryId,
} from "@/lib/progress/day";

const base = {
  totals: {} as Record<string, number>,
  entries: {} as Record<string, never[]>,
};

describe("applyProgressToHeatmap", () => {
  it("keys the patch by the local YYYY-MM-DD string", () => {
    const next = applyProgressToHeatmap(base, "2026-08-17", {
      materialId: "m1",
      title: "Book",
      metricType: "pages",
      delta: 12,
    });

    expect(next.totals["2026-08-17"]).toBe(12);
    expect(next.entries["2026-08-17"]).toEqual([
      {
        materialId: "m1",
        title: "Book",
        metricType: "pages",
        delta: 12,
      },
    ]);
  });

  it("merges same-sign deltas and keeps plus/minus apart", () => {
    const afterPlus = applyProgressToHeatmap(base, "2026-08-17", {
      materialId: "m1",
      title: "Book",
      metricType: "pages",
      delta: 10,
    });
    const afterMore = applyProgressToHeatmap(afterPlus, "2026-08-17", {
      materialId: "m1",
      title: "Book",
      metricType: "pages",
      delta: 5,
    });
    const afterMinus = applyProgressToHeatmap(afterMore, "2026-08-17", {
      materialId: "m1",
      title: "Book",
      metricType: "pages",
      delta: -3,
    });

    expect(afterMinus.totals["2026-08-17"]).toBe(12);
    expect(afterMinus.entries["2026-08-17"]).toEqual([
      {
        materialId: "m1",
        title: "Book",
        metricType: "pages",
        delta: -3,
      },
      {
        materialId: "m1",
        title: "Book",
        metricType: "pages",
        delta: 15,
      },
    ]);
  });

  it("ignores a zero delta without rewriting the patch", () => {
    const next = applyProgressToHeatmap(base, "2026-08-17", {
      materialId: "m1",
      title: "Book",
      metricType: "pages",
      delta: 0,
    });
    expect(next).toBe(base);
  });
});

describe("signed day helpers", () => {
  it("labels plus and minus deltas", () => {
    expect(signedDeltaLabel(12)).toBe("+12");
    expect(signedDeltaLabel(-3)).toBe("-3");
    expect(signedDeltaLabel(0)).toBe("0");
  });

  it("keeps plus and minus ids distinct", () => {
    expect(
      signedEntryId({
        materialId: "m1",
        title: "Book",
        metricType: "pages",
        delta: 4,
      }),
    ).toBe("m1:pos");
    expect(
      signedEntryId({
        materialId: "m1",
        title: "Book",
        metricType: "pages",
        delta: -4,
      }),
    ).toBe("m1:neg");
  });

  it("skips a zero delta when grouping", () => {
    const grouped = new Map();
    addSignedDayEntry(grouped, "2026-08-17", {
      materialId: "m1",
      title: "Book",
      metricType: "pages",
      delta: 0,
    });
    expect(signedDayEntries(grouped)).toEqual({});
  });
});
