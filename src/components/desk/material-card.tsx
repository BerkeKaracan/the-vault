"use client";

import { useEffect, useState, useTransition } from "react";
import {
  logProgress,
  markCompleted,
  shelveMaterial,
} from "@/app/(app)/materials-actions";
import { Cover } from "@/components/materials/cover";
import type { ErrorKey } from "@/i18n/dictionaries";
import { useI18n } from "@/i18n/provider";
import { t } from "@/i18n/t";
import { getLocalDateString } from "@/lib/local-date";
import type { Material } from "@/lib/types";

function progressPercent(material: Material) {
  if (!material.total_pages || material.total_pages <= 0) return null;
  return Math.min(
    100,
    Math.round((material.current_page / material.total_pages) * 100),
  );
}

function translateError(
  dictionary: ReturnType<typeof useI18n>["dictionary"],
  code: string,
) {
  if (code in dictionary.errors) {
    return dictionary.errors[code as ErrorKey];
  }
  return dictionary.errors.generic;
}

export function MaterialCard({
  material,
  priority = false,
}: {
  material: Material;
  priority?: boolean;
}) {
  const { dictionary } = useI18n();
  const [pageAfter, setPageAfter] = useState(
    String(Math.max(material.current_page + 1, 1)),
  );
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const percent = progressPercent(material);

  useEffect(() => {
    setPageAfter(String(Math.max(material.current_page + 1, 1)));
  }, [material.current_page]);

  const progressLabel = material.total_pages
    ? t(dictionary.desk.pageOf, {
        current: material.current_page,
        total: material.total_pages,
      })
    : t(dictionary.desk.pageOnly, { page: material.current_page });

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
    <li className="group flex flex-col gap-4 rounded-lg border border-zinc-900 bg-zinc-950/50 p-4 transition hover:border-zinc-700">
      <div className="mx-auto w-36 sm:mx-0 sm:w-40">
        <Cover
          title={material.title}
          author={material.author}
          coverUrl={material.cover_url}
          priority={priority}
        />
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <h3 className="line-clamp-2 text-base font-medium tracking-tight text-zinc-100">
          {material.title}
        </h3>
        {material.author ? (
          <p className="truncate text-sm text-zinc-500">{material.author}</p>
        ) : null}
        <p className="font-mono text-xs text-zinc-600">
          {progressLabel}
          {percent !== null ? ` · %${percent}` : ""}
        </p>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-900">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-500"
            style={{ width: `${percent ?? 8}%` }}
          />
        </div>

        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const next = Number(pageAfter);
            run(() =>
              logProgress({
                materialId: material.id,
                pageAfter: next,
                loggedOn: getLocalDateString(),
              }),
            );
          }}
        >
          <input
            type="number"
            min={material.current_page + 1}
            value={pageAfter}
            onChange={(e) => setPageAfter(e.target.value)}
            aria-label={dictionary.desk.pageInput}
            className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 font-mono text-sm text-zinc-100 outline-none focus:border-zinc-600"
          />
          <button
            type="submit"
            disabled={pending}
            className="shrink-0 rounded-md bg-zinc-100 px-2.5 py-1.5 text-xs font-medium text-zinc-950 disabled:opacity-40"
          >
            {dictionary.desk.updateProgress}
          </button>
        </form>

        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => markCompleted(material.id))}
            className="rounded-md border border-zinc-800 px-2.5 py-1.5 text-xs text-zinc-300 hover:border-zinc-600 disabled:opacity-40"
          >
            {dictionary.desk.markCompleted}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => shelveMaterial(material.id))}
            className="rounded-md border border-zinc-800 px-2.5 py-1.5 text-xs text-zinc-500 hover:border-zinc-600 hover:text-zinc-300 disabled:opacity-40"
          >
            {dictionary.desk.shelve}
          </button>
        </div>

        {message ? (
          <output className="mt-2 text-xs text-zinc-500">{message}</output>
        ) : null}
      </div>
    </li>
  );
}
