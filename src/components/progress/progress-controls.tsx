"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { logProgress } from "@/app/(app)/materials-actions";
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

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const QUICK = [10, 50] as const;

type StoredTimer = {
  startedAt: number | null;
  elapsed: number;
  running: boolean;
};

function timerKey(materialId: string) {
  return `vault-session:${materialId}`;
}

function readTimer(materialId: string): StoredTimer | null {
  try {
    const raw = sessionStorage.getItem(timerKey(materialId));
    if (!raw) return null;
    return JSON.parse(raw) as StoredTimer;
  } catch {
    return null;
  }
}

function writeTimer(materialId: string, value: StoredTimer) {
  try {
    sessionStorage.setItem(timerKey(materialId), JSON.stringify(value));
  } catch {
    /* ignore quota */
  }
}

function clearTimer(materialId: string) {
  try {
    sessionStorage.removeItem(timerKey(materialId));
  } catch {
    /* ignore */
  }
}

export function ProgressControls({
  material,
  showTimer = true,
}: {
  material: Material;
  showTimer?: boolean;
}) {
  const { dictionary } = useI18n();
  const [pageAfter, setPageAfter] = useState(
    String(Math.max(material.current_page + 1, 1)),
  );
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [ready, setReady] = useState(false);
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    setPageAfter(String(Math.max(material.current_page + 1, 1)));
    setMessage(null);
  }, [material.current_page]);

  useEffect(() => {
    const stored = readTimer(material.id);
    if (stored?.running && stored.startedAt) {
      startedAt.current = stored.startedAt;
      setElapsed(
        Math.max(0, Math.floor((Date.now() - stored.startedAt) / 1000)),
      );
      setRunning(true);
    } else if (stored) {
      startedAt.current = stored.startedAt;
      setElapsed(stored.elapsed ?? 0);
    }
    setReady(true);
  }, [material.id]);

  useEffect(() => {
    if (!ready) return;
    writeTimer(material.id, {
      startedAt: startedAt.current,
      elapsed,
      running,
    });
  }, [material.id, elapsed, running, ready]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      if (startedAt.current) {
        setElapsed(Math.floor((Date.now() - startedAt.current) / 1000));
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const unit = metricUnit(dictionary, material.metric_type);
  const maxPage = material.total_pages;

  function commit(nextPage: number) {
    const capped =
      maxPage != null ? Math.min(nextPage, maxPage) : Math.floor(nextPage);
    if (capped <= material.current_page) return;
    const duration =
      running && startedAt.current
        ? Math.max(1, Math.floor((Date.now() - startedAt.current) / 1000))
        : elapsed > 0
          ? elapsed
          : undefined;
    setMessage(null);
    startTransition(async () => {
      const result = await logProgress({
        materialId: material.id,
        pageAfter: capped,
        loggedOn: getLocalDateString(),
        durationSeconds: duration,
        unitsDelta: capped - material.current_page,
      });
      if (!result.ok) {
        setMessage(translateError(dictionary, result.error ?? "generic"));
        return;
      }
      startedAt.current = null;
      setRunning(false);
      setElapsed(0);
      clearTimer(material.id);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {showTimer ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (running) {
                setRunning(false);
                return;
              }
              startedAt.current = Date.now() - elapsed * 1000;
              setRunning(true);
            }}
            className="rounded-md border border-white/12 px-2.5 py-1 font-mono text-[0.7rem] tracking-wide text-zinc-300 uppercase hover:border-white/25"
          >
            {running ? dictionary.desk.timerStop : dictionary.desk.timerStart}
          </button>
          <span className="font-mono text-xs text-zinc-500">
            {formatElapsed(elapsed)}
          </span>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {QUICK.map((step) => (
          <button
            key={step}
            type="button"
            disabled={pending}
            onClick={() => commit(material.current_page + step)}
            className="rounded-md border border-white/12 px-2.5 py-1.5 font-mono text-xs text-zinc-300 hover:border-white/25 disabled:opacity-40"
          >
            {t(dictionary.desk.quickAdd, { n: step })}
          </button>
        ))}
      </div>

      <form
        className="flex flex-wrap items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          commit(Number(pageAfter));
        }}
      >
        <input
          type="number"
          min={material.current_page + 1}
          value={pageAfter}
          onChange={(e) => setPageAfter(e.target.value)}
          aria-label={t(dictionary.desk.pageInput, { unit })}
          className="w-24 rounded-md border border-white/10 bg-black/50 px-3 py-2 font-mono text-sm text-zinc-100 outline-none focus:border-accent/50"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:opacity-90 disabled:opacity-40"
        >
          {dictionary.desk.updateProgress}
        </button>
        <span className="font-mono text-[0.65rem] text-zinc-600 uppercase">
          {unit}
        </span>
      </form>
      {message ? (
        <output className="font-mono text-xs text-zinc-500">{message}</output>
      ) : null}
    </div>
  );
}
