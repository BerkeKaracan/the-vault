"use client";

import { useI18n } from "@/i18n/provider";
import { ACCENTS } from "@/lib/catalog";
import type { MetricType } from "@/lib/types";

const SWATCH: Record<(typeof ACCENTS)[number], string> = {
  emerald: "bg-[#4ade80]",
  blue: "bg-[#60a5fa]",
  amber: "bg-[#fbbf24]",
};

export function AccentSwatches({
  value,
  onChange,
}: {
  value: (typeof ACCENTS)[number];
  onChange: (accent: (typeof ACCENTS)[number]) => void;
}) {
  const { dictionary } = useI18n();
  const labels = {
    emerald: dictionary.settings.accentEmerald,
    blue: dictionary.settings.accentBlue,
    amber: dictionary.settings.accentAmber,
  } as const;

  return (
    <fieldset>
      <legend className="text-sm text-zinc-400">
        {dictionary.settings.accent}
      </legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {ACCENTS.map((accent) => (
          <button
            key={accent}
            type="button"
            onClick={() => onChange(accent)}
            aria-pressed={value === accent}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
              value === accent
                ? "border-white/30 bg-white/8 text-zinc-100"
                : "border-white/10 text-zinc-400 hover:border-white/20"
            }`}
          >
            <span className={`size-3 rounded-full ${SWATCH[accent]}`} />
            {labels[accent]}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function MetricFields({
  metricType,
  onMetricChange,
  tags,
  onTagsChange,
}: {
  metricType: MetricType;
  onMetricChange: (metric: MetricType) => void;
  tags: string;
  onTagsChange: (tags: string) => void;
}) {
  const { dictionary } = useI18n();

  return (
    <div className="flex flex-col gap-4">
      <fieldset>
        <legend className="text-sm text-zinc-400">
          {dictionary.add.metricLabel}
        </legend>
        <div className="mt-2 flex flex-wrap gap-3 text-sm text-zinc-300">
          {(
            [
              ["pages", dictionary.add.metricPages],
              ["questions", dictionary.add.metricQuestions],
              ["chapters", dictionary.add.metricChapters],
            ] as const
          ).map(([value, label]) => (
            <label key={value} className="flex items-center gap-2">
              <input
                type="radio"
                name="metric-type"
                checked={metricType === value}
                onChange={() => onMetricChange(value)}
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="flex flex-col gap-1.5 text-sm text-zinc-400">
        {dictionary.add.tagsLabel}
        <input
          value={tags}
          onChange={(e) => onTagsChange(e.target.value)}
          placeholder={dictionary.add.tagsPlaceholder}
          className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-accent/50"
        />
      </label>
    </div>
  );
}
