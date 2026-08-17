"use client";

import { useI18n } from "@/i18n/provider";
import { ACCENTS } from "@/lib/catalog/fields";
import type { MetricType } from "@/lib/types";

const SWATCH: Record<(typeof ACCENTS)[number], string> = {
  emerald: "bg-[var(--accent-emerald)]",
  blue: "bg-[var(--accent-blue)]",
  amber: "bg-[var(--accent-amber)]",
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
      <legend className="text-sm text-muted">
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
                ? "border-foreground/30 bg-foreground/8 text-foreground"
                : "border-border text-muted hover:border-foreground/20"
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

export function MetricTypeRadios({
  value,
  onChange,
  name = "metric-type",
}: {
  value: MetricType;
  onChange: (metric: MetricType) => void;
  name?: string;
}) {
  const { dictionary } = useI18n();

  return (
    <fieldset>
      <legend className="text-sm text-muted">
        {dictionary.add.metricLabel}
      </legend>
      <div className="mt-2 flex flex-wrap gap-3 text-sm text-foreground/80">
        {(
          [
            ["pages", dictionary.add.metricPages],
            ["questions", dictionary.add.metricQuestions],
            ["chapters", dictionary.add.metricChapters],
          ] as const
        ).map(([metric, label]) => (
          <label key={metric} className="flex items-center gap-2">
            <input
              type="radio"
              name={name}
              checked={value === metric}
              onChange={() => onChange(metric)}
            />
            {label}
          </label>
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
      <MetricTypeRadios value={metricType} onChange={onMetricChange} />
      <label className="flex flex-col gap-1.5 text-sm text-muted">
        {dictionary.add.tagsLabel}
        <input
          value={tags}
          onChange={(e) => onTagsChange(e.target.value)}
          placeholder={dictionary.add.tagsPlaceholder}
          className="rounded-md border border-border bg-elevated px-3 py-2 text-foreground outline-none focus:border-accent/50"
        />
      </label>
    </div>
  );
}
