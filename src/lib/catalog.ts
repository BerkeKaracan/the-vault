import type { AccentColor, MetricType } from "@/lib/types";

export const ACCENTS: readonly AccentColor[] = ["emerald", "blue", "amber"];

export function isAccentColor(value: string): value is AccentColor {
  return value === "emerald" || value === "blue" || value === "amber";
}

export const METRICS: readonly MetricType[] = [
  "pages",
  "questions",
  "chapters",
];

export function isMetricType(value: string): value is MetricType {
  return value === "pages" || value === "questions" || value === "chapters";
}

export function parseTags(raw: string): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const part of raw.split(/[,;]+/)) {
    const tag = part.trim().slice(0, 24);
    if (!tag) continue;
    const key = tag.toLocaleLowerCase("tr");
    if (seen.has(key)) continue;
    seen.add(key);
    tags.push(tag);
    if (tags.length >= 8) break;
  }
  return tags;
}

const TAG_TONES = [
  "border-emerald-400/30 bg-emerald-400/10 text-emerald-800 dark:text-emerald-200",
  "border-sky-400/30 bg-sky-400/10 text-sky-800 dark:text-sky-200",
  "border-amber-400/30 bg-amber-400/10 text-amber-800 dark:text-amber-200",
  "border-rose-400/30 bg-rose-400/10 text-rose-800 dark:text-rose-200",
  "border-violet-400/30 bg-violet-400/10 text-violet-800 dark:text-violet-200",
  "border-zinc-400/30 bg-zinc-400/10 text-zinc-800 dark:text-zinc-200",
] as const;

export function tagTone(tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = (hash + tag.charCodeAt(i) * (i + 1)) % TAG_TONES.length;
  }
  return TAG_TONES[hash] ?? TAG_TONES[0];
}
