import { unstable_rethrow } from "next/navigation";
import { cache } from "react";
import { requireUser } from "@/lib/auth";
import { isMetricType } from "@/lib/catalog/fields";
import {
  addSignedDayEntry,
  type SignedDayEntry,
  signedDayEntries,
} from "@/lib/progress/day";
import { createClient } from "@/lib/supabase/server";
import type { MetricType } from "@/lib/types";

export type LogDayEntry = SignedDayEntry;

export type MonthLog = {
  totals: Record<string, number>;
  entries: Record<string, LogDayEntry[]>;
};

const EMPTY_LOG: MonthLog = { totals: {}, entries: {} };

function nestedTitle(
  value:
    | { title: string | null; metric_type: string | null }
    | { title: string | null; metric_type: string | null }[]
    | null,
): { title: string; metricType: MetricType } {
  const row = Array.isArray(value) ? value[0] : value;
  return {
    title: row?.title?.trim() || "—",
    metricType:
      row?.metric_type && isMetricType(row.metric_type)
        ? row.metric_type
        : "pages",
  };
}

export const getMonthLog = cache(
  async (year: number, month: number): Promise<MonthLog> => {
    try {
      const [supabase, user] = await Promise.all([
        createClient(),
        requireUser(),
      ]);

      const from = `${year}-${String(month).padStart(2, "0")}-01`;
      const nextMonth = month === 12 ? 1 : month + 1;
      const nextYear = month === 12 ? year + 1 : year;
      const to = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;

      const { data, error } = await supabase
        .from("progress_entries")
        .select(
          "logged_on, pages_delta, material_id, materials(title, metric_type)",
        )
        .eq("user_id", user.id)
        .gte("logged_on", from)
        .lt("logged_on", to)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("[getMonthLog]", error.message);
        return EMPTY_LOG;
      }

      const totals: Record<string, number> = {};
      const grouped = new Map<string, Map<string, LogDayEntry>>();

      for (const row of data ?? []) {
        totals[row.logged_on] = (totals[row.logged_on] ?? 0) + row.pages_delta;
        const material = nestedTitle(row.materials);
        addSignedDayEntry(grouped, row.logged_on, {
          materialId: row.material_id,
          title: material.title,
          metricType: material.metricType,
          delta: row.pages_delta,
        });
      }

      return { totals, entries: signedDayEntries(grouped) };
    } catch (error) {
      unstable_rethrow(error);
      console.error("[getMonthLog]", error);
      return EMPTY_LOG;
    }
  },
);
