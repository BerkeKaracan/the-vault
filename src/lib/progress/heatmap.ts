import { unstable_rethrow } from "next/navigation";
import { cache } from "react";
import { requireUser } from "@/lib/auth";
import { isMetricType } from "@/lib/catalog/fields";
import {
  addDaysToDateString,
  dateStringInTimeZone,
  normalizeLoggedOn,
} from "@/lib/local-date";
import { getSessionProfile } from "@/lib/profile";
import {
  addSignedDayEntry,
  type SignedDayEntry,
  signedDayEntries,
} from "@/lib/progress/day";
import { createClient } from "@/lib/supabase/server";
import { resolveTimezone } from "@/lib/timezones";
import type { MetricType } from "@/lib/types";

const HEATMAP_WEEKS = 26;
/** Extra days so a UTC server still covers the client's 26-week local grid. */
const HEATMAP_LOOKBACK_DAYS = HEATMAP_WEEKS * 7 + 14;

/** pages keyed by logged_on (YYYY-MM-DD local calendar day from client). */
export type HeatmapDayEntry = SignedDayEntry;

export type HeatmapData = {
  totals: Record<string, number>;
  entries: Record<string, HeatmapDayEntry[]>;
};

type NestedMaterial = {
  title: string | null;
  metric_type: string | null;
};

type HeatmapRow = {
  logged_on: string;
  pages_delta: number;
  material_id: string;
  materials?: NestedMaterial | NestedMaterial[] | null;
};

function heatmapLookbackDate(timeZone: string): string {
  const today = dateStringInTimeZone(new Date(), timeZone);
  return addDaysToDateString(today, -HEATMAP_LOOKBACK_DAYS);
}

function nestedMaterial(
  value: NestedMaterial | NestedMaterial[] | null | undefined,
): NestedMaterial | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function materialFields(
  row: HeatmapRow,
  extras: Map<string, { title: string; metricType: MetricType }>,
): { title: string; metricType: MetricType } {
  const nested = nestedMaterial(row.materials);
  if (nested) {
    return {
      title: nested.title?.trim() || "—",
      metricType:
        nested.metric_type && isMetricType(nested.metric_type)
          ? nested.metric_type
          : "pages",
    };
  }
  return extras.get(row.material_id) ?? { title: "—", metricType: "pages" };
}

/** Read-only. Must not live in a `"use server"` file — those are actions. */
export const getHeatmapData = cache(async (): Promise<HeatmapData> => {
  try {
    const [supabase, user, session] = await Promise.all([
      createClient(),
      requireUser(),
      getSessionProfile(),
    ]);
    const timeZone = resolveTimezone(session.profile?.timezone);
    const since = heatmapLookbackDate(timeZone);

    const withJoin = await supabase
      .from("progress_entries")
      .select(
        "logged_on, pages_delta, material_id, materials(title, metric_type)",
      )
      .eq("user_id", user.id)
      .gte("logged_on", since)
      .order("created_at", { ascending: true });

    let rows: HeatmapRow[] = withJoin.data ?? [];
    const extras = new Map<string, { title: string; metricType: MetricType }>();

    if (withJoin.error) {
      console.error("[getHeatmapData] embed", withJoin.error.message);
      const plain = await supabase
        .from("progress_entries")
        .select("logged_on, pages_delta, material_id")
        .eq("user_id", user.id)
        .gte("logged_on", since)
        .order("created_at", { ascending: true });

      if (plain.error) {
        console.error("[getHeatmapData]", plain.error.message);
        throw new Error(plain.error.message);
      }

      rows = plain.data ?? [];
      const ids = [...new Set(rows.map((row) => row.material_id))];
      if (ids.length > 0) {
        const { data: materials } = await supabase
          .from("materials")
          .select("id, title, metric_type")
          .in("id", ids);
        for (const material of materials ?? []) {
          extras.set(material.id, {
            title: material.title?.trim() || "—",
            metricType: isMetricType(material.metric_type)
              ? material.metric_type
              : "pages",
          });
        }
      }
    }

    const totals: Record<string, number> = {};
    const grouped = new Map<string, Map<string, HeatmapDayEntry>>();

    for (const row of rows) {
      const date = normalizeLoggedOn(row.logged_on);
      if (!date) continue;
      totals[date] = (totals[date] ?? 0) + row.pages_delta;
      const material = materialFields(row, extras);
      addSignedDayEntry(grouped, date, {
        materialId: row.material_id,
        title: material.title,
        metricType: material.metricType,
        delta: row.pages_delta,
      });
    }

    return { totals, entries: signedDayEntries(grouped) };
  } catch (error) {
    unstable_rethrow(error);
    console.error("[getHeatmapData]", error);
    throw error;
  }
});
