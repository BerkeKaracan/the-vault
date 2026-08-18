import { unstable_rethrow } from "next/navigation";
import { cache } from "react";
import { requireUser } from "@/lib/auth";
import { isMetricType } from "@/lib/catalog/fields";
import { normalizeLoggedOn } from "@/lib/local-date";
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

type NestedMaterial = {
  title: string | null;
  metric_type: string | null;
};

type LogRow = {
  logged_on: string;
  pages_delta: number;
  material_id: string;
  materials?: NestedMaterial | NestedMaterial[] | null;
};

function nestedTitle(
  value: NestedMaterial | NestedMaterial[] | null | undefined,
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

      const withJoin = await supabase
        .from("progress_entries")
        .select(
          "logged_on, pages_delta, material_id, materials(title, metric_type)",
        )
        .eq("user_id", user.id)
        .gte("logged_on", from)
        .lt("logged_on", to)
        .order("created_at", { ascending: true });

      let rows: LogRow[] = withJoin.data ?? [];
      const extras = new Map<
        string,
        { title: string; metricType: MetricType }
      >();

      if (withJoin.error) {
        console.error("[getMonthLog] embed", withJoin.error.message);
        const plain = await supabase
          .from("progress_entries")
          .select("logged_on, pages_delta, material_id")
          .eq("user_id", user.id)
          .gte("logged_on", from)
          .lt("logged_on", to)
          .order("created_at", { ascending: true });

        if (plain.error) {
          console.error("[getMonthLog]", plain.error.message);
          return EMPTY_LOG;
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
      const grouped = new Map<string, Map<string, LogDayEntry>>();

      for (const row of rows) {
        const date = normalizeLoggedOn(row.logged_on);
        if (!date) continue;
        totals[date] = (totals[date] ?? 0) + row.pages_delta;
        const material =
          extras.get(row.material_id) ?? nestedTitle(row.materials);
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
      console.error("[getMonthLog]", error);
      return EMPTY_LOG;
    }
  },
);
