import { describe, expect, it } from "vitest";
import { applyProgressToHeatmap } from "@/lib/progress/day";

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
});
