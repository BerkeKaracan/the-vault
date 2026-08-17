import type { AccentColor, MetricType } from "@/lib/types";

export const ACCENTS: readonly AccentColor[] = ["emerald", "blue", "amber"];

export function isAccentColor(value: string): value is AccentColor {
  return value === "emerald" || value === "blue" || value === "amber";
}

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
  "border-border bg-foreground/8 text-foreground",
  "border-border bg-foreground/5 text-muted",
  "border-accent/30 bg-accent/10 text-foreground",
  "border-border bg-elevated text-foreground/80",
  "border-accent/20 bg-[var(--accent-glow)] text-foreground",
  "border-border bg-foreground/10 text-muted",
] as const;

export function tagTone(tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = (hash + tag.charCodeAt(i) * (i + 1)) % TAG_TONES.length;
  }
  return TAG_TONES[hash] ?? TAG_TONES[0];
}
