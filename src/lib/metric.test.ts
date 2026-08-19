import { describe, expect, it } from "vitest";
import { dictionaries } from "@/i18n/dictionaries";
import { metricUnit } from "@/lib/metric";

describe("metricUnit", () => {
  const tr = dictionaries.tr;
  const en = dictionaries.en;

  it("picks singular and plural for each metric", () => {
    expect(metricUnit(tr, "pages", 1)).toBe("sayfa");
    expect(metricUnit(tr, "pages", 2)).toBe("sayfa");
    expect(metricUnit(en, "questions", 1)).toBe("question");
    expect(metricUnit(en, "questions", 8)).toBe("questions");
    expect(metricUnit(en, "chapters", 1)).toBe("chapter");
    expect(metricUnit(en, "chapters")).toBe("chapters");
  });
});
