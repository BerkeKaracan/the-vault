"use client";

import { useState, useTransition } from "react";
import {
  activateMaterial,
  markCompleted,
  shelveMaterial,
} from "@/app/(app)/materials-actions";
import { ProgressControls } from "@/components/progress/progress-controls";
import type { ErrorKey } from "@/i18n/dictionaries";
import { useI18n } from "@/i18n/provider";
import { t } from "@/i18n/t";
import { getLocalDateString } from "@/lib/local-date";
import { metricUnit } from "@/lib/metric";
import type { Material } from "@/lib/types";

function translateError(
  dictionary: ReturnType<typeof useI18n>["dictionary"],
  code: string,
) {
  if (code in dictionary.errors) {
    return dictionary.errors[code as ErrorKey];
  }
  return dictionary.errors.generic;
}

export function LibraryActions({
  material,
  pace,
}: {
  material: Material;
  pace?: number | null;
}) {
  const { dictionary } = useI18n();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const progressLabel = material.total_pages
    ? t(dictionary.desk.pageOf, {
        current: material.current_page,
        total: material.total_pages,
      })
    : t(dictionary.desk.pageOnly, {
        page: material.current_page,
        unit: metricUnit(
          dictionary,
          material.metric_type,
          material.current_page,
        ),
      });

  function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setMessage(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setMessage(translateError(dictionary, result.error ?? "generic"));
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <p data-private className="font-mono text-xs text-muted">
        {progressLabel}
      </p>
      {pace != null ? (
        <p className="font-mono text-xs text-muted">
          {t(dictionary.desk.pace, {
            rate: pace,
            unit: metricUnit(dictionary, material.metric_type),
          })}
        </p>
      ) : null}

      {material.status === "active" ? (
        <>
          <ProgressControls material={material} />
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                run(() => markCompleted(material.id, getLocalDateString()))
              }
              className="px-2 text-xs text-muted hover:text-foreground/80 disabled:opacity-40"
            >
              {dictionary.desk.markCompleted}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => shelveMaterial(material.id))}
              className="px-2 text-xs text-muted hover:text-foreground/80 disabled:opacity-40"
            >
              {dictionary.desk.shelve}
            </button>
          </div>
        </>
      ) : (
        <>
          <ProgressControls material={material} showTimer={false} />
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => activateMaterial(material.id))}
            className="w-fit rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-40"
          >
            {dictionary.vault.activate}
          </button>
        </>
      )}

      {message ? (
        <output className="font-mono text-xs text-muted">{message}</output>
      ) : null}
    </div>
  );
}
