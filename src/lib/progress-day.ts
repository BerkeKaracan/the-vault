import type { MetricType } from "@/lib/types";

export type SignedDayEntry = {
  materialId: string;
  title: string;
  metricType: MetricType;
  delta: number;
};

function bucketKey(materialId: string, delta: number): string {
  return `${materialId}:${delta < 0 ? "neg" : "pos"}`;
}

/** Same-sign deltas merge. Plus and minus for one material stay separate. */
export function addSignedDayEntry(
  grouped: Map<string, Map<string, SignedDayEntry>>,
  date: string,
  entry: SignedDayEntry,
): void {
  if (entry.delta === 0) return;
  const byKey = grouped.get(date) ?? new Map();
  const key = bucketKey(entry.materialId, entry.delta);
  const existing = byKey.get(key);
  if (existing) {
    existing.delta += entry.delta;
  } else {
    byKey.set(key, { ...entry });
  }
  grouped.set(date, byKey);
}

export function signedDayEntries(
  grouped: Map<string, Map<string, SignedDayEntry>>,
): Record<string, SignedDayEntry[]> {
  const entries: Record<string, SignedDayEntry[]> = {};
  for (const [date, byKey] of grouped) {
    entries[date] = [...byKey.values()]
      .filter((item) => item.delta !== 0)
      .sort((a, b) => {
        const signA = a.delta < 0 ? 0 : 1;
        const signB = b.delta < 0 ? 0 : 1;
        if (signA !== signB) return signA - signB;
        return Math.abs(b.delta) - Math.abs(a.delta);
      });
  }
  return entries;
}

export function signedDeltaLabel(delta: number): string {
  return delta > 0 ? `+${delta}` : String(delta);
}

export function signedEntryId(entry: SignedDayEntry): string {
  return bucketKey(entry.materialId, entry.delta);
}
