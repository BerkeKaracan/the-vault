import type { Dictionary } from "@/i18n/dictionaries";
import type { MetricType } from "@/lib/types";

export function metricUnit(
  dictionary: Dictionary,
  metric: MetricType,
  count?: number,
): string {
  if (metric === "questions") {
    return count === 1
      ? dictionary.metric.question
      : dictionary.metric.questions;
  }
  if (metric === "chapters") {
    return count === 1 ? dictionary.metric.chapter : dictionary.metric.chapters;
  }
  return count === 1 ? dictionary.metric.page : dictionary.metric.pages;
}
