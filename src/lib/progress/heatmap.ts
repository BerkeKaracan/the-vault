import { cache } from "react";
import { getAuthUser } from "@/lib/auth";
import { isMetricType } from "@/lib/catalog/fields";
import { getLocalDateString } from "@/lib/local-date";
import {
  addSignedDayEntry,
  type SignedDayEntry,
  signedDayEntries,
} from "@/lib/progress/day";
import { createClient } from "@/lib/supabase/server";

const HEATMAP_WEEKS = 26;
/** Extra days so a UTC server still covers the client's 26-week local grid. */
const HEATMAP_LOOKBACK_DAYS = HEATMAP_WEEKS * 7 + 14;

/** pages keyed by logged_on (YYYY-MM-DD local calendar day from client). */
export type HeatmapDayEntry = SignedDayEntry;

export type HeatmapData = {
  totals: Record<string, number>;
  entries: Record<string, HeatmapDayEntry[]>;
};

const EMPTY_HEATMAP: HeatmapData = { totals: {}, entries: {} };

type NestedMaterial = {
  title: string | null;
  metric_type: string | null;
};

function heatmapLookbackDate(): string {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - HEATMAP_LOOKBACK_DAYS);
  return getLocalDateString(date);
}

function nestedMaterial(
  value: NestedMaterial | NestedMaterial[] | null,
): NestedMaterial | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

/** Read-only. Must not live in a `"use server"` file — those are actions. */
export const getHeatmapData = cache(async (): Promise<HeatmapData> => {
  try {
    const [supabase, user] = await Promise.all([createClient(), getAuthUser()]);
    if (!user) return EMPTY_HEATMAP;

    const { data, error } = await supabase
      .from("progress_entries")
      .select(
        "logged_on, pages_delta, material_id, materials(title, metric_type)",
      )
      .eq("user_id", user.id)
      .gte("logged_on", heatmapLookbackDate())
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[getHeatmapData]", error.message);
      return EMPTY_HEATMAP;
    }

    const totals: Record<string, number> = {};
    const grouped = new Map<string, Map<string, HeatmapDayEntry>>();

    for (const row of data ?? []) {
      totals[row.logged_on] = (totals[row.logged_on] ?? 0) + row.pages_delta;
      const material = nestedMaterial(row.materials);
      addSignedDayEntry(grouped, row.logged_on, {
        materialId: row.material_id,
        title: material?.title?.trim() || "—",
        metricType:
          material?.metric_type && isMetricType(material.metric_type)
            ? material.metric_type
            : "pages",
        delta: row.pages_delta,
      });
    }

    return { totals, entries: signedDayEntries(grouped) };
  } catch (error) {
    console.error("[getHeatmapData]", error);
    return EMPTY_HEATMAP;
  }
});
