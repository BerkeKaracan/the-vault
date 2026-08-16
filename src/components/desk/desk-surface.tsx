"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { markCompleted, shelveMaterial } from "@/app/(app)/materials-actions";
import { Cover } from "@/components/materials/cover";
import { ProgressControls } from "@/components/progress/progress-controls";
import type { ErrorKey } from "@/i18n/dictionaries";
import { useI18n } from "@/i18n/provider";
import { t } from "@/i18n/t";
import { metricUnit } from "@/lib/metric";
import type { Material } from "@/lib/types";

const DESK_LIMIT = 3;

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

function CoverSlot({
  material,
  slot,
  selected,
  onSelect,
  priority,
}: {
  material: Material;
  slot: number;
  selected: boolean;
  onSelect: () => void;
  priority: boolean;
}) {
  const { dictionary } = useI18n();
  const percent = progressPercent(material);

  return (
    <div
      className={`group flex flex-col items-center text-left transition duration-500 ${selected ? "-translate-y-3" : "opacity-55 hover:opacity-85"}`}
    >
      <p className="mb-3 font-mono text-[0.58rem] tracking-[0.28em] text-muted uppercase">
        {t(dictionary.desk.slotLabel, { n: slot })}
      </p>
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className={`w-full max-w-56 ${selected ? "ring-1 ring-accent/40" : ""}`}
      >
        <Cover
          title={material.title}
          author={material.author}
          coverUrl={material.cover_url}
          priority={priority}
          sizes="(max-width: 768px) 30vw, 224px"
        />
      </button>
      <div className="mt-4 w-full max-w-56">
        <Link
          href={`/materials/${material.id}`}
          data-private
          className="line-clamp-2 font-display text-[0.95rem] leading-snug font-semibold tracking-[-0.02em] text-foreground hover:text-foreground"
        >
          {material.title}
        </Link>
        <div className="mt-3 h-px overflow-hidden bg-border">
          <div
            className="h-full bg-accent"
            style={{ width: `${percent ?? 8}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function EmptyDesk() {
  const { dictionary } = useI18n();

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center px-5 py-16 sm:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-[18%] h-px bg-linear-to-r from-transparent via-border to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[28%] bg-linear-to-t from-[var(--desk-fade)] to-transparent"
      />
      <div className="relative mx-auto max-w-md text-center">
        <p className="font-mono text-[0.58rem] tracking-[0.28em] text-muted uppercase">
          {dictionary.nav.desk}
        </p>
        <h1 className="mt-3 font-display text-2xl font-semibold tracking-[-0.03em] text-foreground sm:text-3xl">
          {dictionary.desk.emptyTitle}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {dictionary.desk.emptyBody}
        </p>
        <Link
          href="/add"
          className="mt-7 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-fg transition hover:opacity-90"
        >
          {dictionary.desk.emptyCta}
        </Link>
      </div>
    </div>
  );
}

function EmptySlot({ slot }: { slot: number }) {
  const { dictionary } = useI18n();

  return (
    <Link
      href="/add"
      className="flex flex-col items-center opacity-40 transition hover:opacity-80"
    >
      <p className="mb-3 font-mono text-[0.58rem] tracking-[0.28em] text-muted uppercase">
        {t(dictionary.desk.slotLabel, { n: slot })}
      </p>
      <div className="flex aspect-2/3 w-full max-w-56 items-center justify-center rounded-sm border border-dashed border-border">
        <span className="font-display text-3xl text-muted">+</span>
      </div>
      <p className="mt-4 text-sm text-muted">{dictionary.desk.emptySlot}</p>
    </Link>
  );
}

function DeskDock({ material }: { material: Material }) {
  const { dictionary } = useI18n();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const percent = progressPercent(material);
  const left =
    material.total_pages != null
      ? Math.max(0, material.total_pages - material.current_page)
      : null;
  const unit = metricUnit(dictionary, material.metric_type, left ?? undefined);

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
    <div className="border-t border-border bg-surface/90 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-5 py-4 sm:px-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 lg:max-w-sm">
          <p
            data-private
            className="truncate font-display text-lg font-semibold tracking-[-0.03em] text-foreground"
          >
            <Link
              href={`/materials/${material.id}`}
              className="hover:text-foreground"
            >
              {material.title}
            </Link>
          </p>
          <p data-private className="mt-1 font-mono text-xs text-muted">
            {progressLabel}
            {left !== null
              ? ` · ${t(dictionary.desk.remainingPages, { count: left, unit })}`
              : ""}
          </p>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-foreground/10">
            <div
              className="h-full bg-accent"
              style={{ width: `${percent ?? 8}%` }}
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <ProgressControls material={material} />
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => markCompleted(material.id))}
              className="px-2 text-xs text-muted hover:text-foreground disabled:opacity-40"
            >
              {dictionary.desk.markCompleted}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => shelveMaterial(material.id))}
              className="px-2 text-xs text-muted hover:text-foreground disabled:opacity-40"
            >
              {dictionary.desk.shelve}
            </button>
          </div>
        </div>
      </div>
      {message ? (
        <output className="mx-auto block w-full max-w-5xl px-5 pb-3 font-mono text-xs text-muted sm:px-8">
          {message}
        </output>
      ) : null}
    </div>
  );
}

export function DeskSurface({ materials }: { materials: Material[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(
    materials[0]?.id ?? null,
  );

  useEffect(() => {
    if (selectedId && materials.some((item) => item.id === selectedId)) return;
    setSelectedId(materials[0]?.id ?? null);
  }, [materials, selectedId]);

  const selected = materials.find((item) => item.id === selectedId) ?? null;
  const empties = Math.max(0, DESK_LIMIT - materials.length);

  if (materials.length === 0) {
    return <EmptyDesk />;
  }

  return (
    <>
      <div className="relative flex flex-1 items-end px-5 pb-2 sm:px-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-[18%] h-px bg-linear-to-r from-transparent via-border to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[28%] bg-linear-to-t from-[var(--desk-fade)] to-transparent"
        />
        <div className="relative mx-auto grid w-full max-w-5xl grid-cols-3 items-end gap-3 sm:gap-8">
          {materials.map((material, index) => (
            <CoverSlot
              key={material.id}
              material={material}
              slot={index + 1}
              selected={material.id === selectedId}
              onSelect={() => setSelectedId(material.id)}
              priority={index === 0}
            />
          ))}
          {(["a", "b", "c"] as const).slice(0, empties).map((key, offset) => (
            <EmptySlot key={key} slot={materials.length + offset + 1} />
          ))}
        </div>
      </div>
      {selected ? <DeskDock key={selected.id} material={selected} /> : null}
    </>
  );
}
