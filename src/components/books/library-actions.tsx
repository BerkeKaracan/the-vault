"use client";

import { useEffect, useState, useTransition } from "react";
import {
  activateMaterial,
  logProgress,
  markCompleted,
  shelveMaterial,
} from "@/app/(app)/materials-actions";
import type { ErrorKey } from "@/i18n/dictionaries";
import { useI18n } from "@/i18n/provider";
import { t } from "@/i18n/t";
import { getLocalDateString } from "@/lib/local-date";
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

export function LibraryActions({ material }: { material: Material }) {
  const { dictionary } = useI18n();
  const [pageAfter, setPageAfter] = useState(
    String(Math.max(material.current_page + 1, 1)),
  );
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setPageAfter(String(Math.max(material.current_page + 1, 1)));
    setMessage(null);
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
    <div className="flex flex-col gap-4">
      <p className="font-mono text-xs text-zinc-500">{progressLabel}</p>

      {material.status === "active" ? (
        <form
          className="flex flex-wrap items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            run(() =>
              logProgress({
                materialId: material.id,
                pageAfter: Number(pageAfter),
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
            className="w-24 rounded-md border border-white/10 bg-black/50 px-3 py-2 font-mono text-sm text-zinc-100 outline-none focus:border-emerald-400/50"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-emerald-400 px-4 py-2 text-sm font-medium text-emerald-950 hover:bg-emerald-300 disabled:opacity-40"
          >
            {dictionary.desk.updateProgress}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => markCompleted(material.id))}
            className="px-2 text-xs text-zinc-400 hover:text-zinc-200 disabled:opacity-40"
          >
            {dictionary.desk.markCompleted}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => shelveMaterial(material.id))}
            className="px-2 text-xs text-zinc-600 hover:text-zinc-300 disabled:opacity-40"
          >
            {dictionary.desk.shelve}
          </button>
        </form>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => activateMaterial(material.id))}
          className="w-fit rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-950 disabled:opacity-40"
        >
          {dictionary.vault.activate}
        </button>
      )}

      {message ? (
        <output className="font-mono text-xs text-zinc-500">{message}</output>
      ) : null}
    </div>
  );
}
