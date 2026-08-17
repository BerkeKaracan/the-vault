"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import {
  markCompleted,
  shelveMaterial,
} from "@/app/(app)/materials/[id]/actions";
import { Cover } from "@/components/materials/cover";
import { ProgressControls } from "@/components/progress/progress-controls";
import type { ErrorKey } from "@/i18n/dictionaries";
import { useI18n } from "@/i18n/provider";
import { t } from "@/i18n/t";
import { getLocalDateString } from "@/lib/local-date";
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

function DeskAtmosphere() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="desk-orb absolute top-[-28%] right-[-18%] size-[70vh] rounded-full bg-[radial-gradient(circle,var(--accent-glow),transparent_68%)] blur-3xl" />
      <div className="desk-orb-alt landing-orb-warm absolute bottom-[-30%] left-[-20%] size-[62vh] rounded-full blur-3xl" />
      <div className="desk-ruling absolute inset-0" />
      <div className="desk-grain absolute inset-[-45%]" />
      <div className="absolute bottom-[10%] left-1/2 h-28 w-[min(42rem,80%)] -translate-x-1/2 rounded-[100%] bg-[radial-gradient(ellipse_at_center,var(--accent-glow),transparent_72%)] blur-2xl" />
      <div className="absolute inset-x-0 bottom-0 h-[32%] bg-linear-to-t from-[var(--desk-fade)] to-transparent" />
    </div>
  );
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
      className="desk-enter"
      style={{ animationDelay: `${(slot - 1) * 110}ms` }}
    >
      <div
        className={`group flex flex-col items-center text-left transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          selected
            ? "-translate-y-5"
            : "opacity-50 hover:-translate-y-2 hover:opacity-90"
        }`}
      >
        <p className="mb-3 font-mono text-[0.58rem] tracking-[0.28em] text-muted uppercase">
          {t(dictionary.desk.slotLabel, { n: slot })}
        </p>
        <button
          type="button"
          onClick={onSelect}
          aria-pressed={selected}
          className="relative w-full max-w-56"
        >
          <span
            className={`absolute -bottom-4 left-1/2 h-8 w-4/5 -translate-x-1/2 rounded-full bg-accent/25 blur-xl transition-opacity duration-500 ${
              selected ? "opacity-100" : "opacity-0 group-hover:opacity-40"
            }`}
          />
          <Cover
            title={material.title}
            author={material.author}
            coverUrl={material.cover_url}
            priority={priority}
            sizes="(max-width: 640px) 80vw, (max-width: 1024px) 40vw, 224px"
            className={`transition-[box-shadow,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              selected
                ? "ring-1 ring-accent/45 shadow-[0_28px_60px_-24px_color-mix(in_srgb,var(--accent)_55%,transparent)]"
                : ""
            }`}
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
              className="h-full bg-accent transition-[width] duration-500"
              style={{ width: `${percent ?? 8}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyDesk() {
  const { dictionary } = useI18n();

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-16 sm:px-8">
      <DeskAtmosphere />
      <div className="desk-enter relative mx-auto max-w-md text-center">
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
          href="/discover"
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
    <div
      className="desk-enter"
      style={{ animationDelay: `${(slot - 1) * 110}ms` }}
    >
      <Link
        href="/discover"
        className="flex flex-col items-center opacity-40 transition hover:-translate-y-1 hover:opacity-80"
      >
        <p className="mb-3 font-mono text-[0.58rem] tracking-[0.28em] text-muted uppercase">
          {t(dictionary.desk.slotLabel, { n: slot })}
        </p>
        <div className="flex aspect-2/3 w-full max-w-56 items-center justify-center rounded-sm border border-dashed border-border">
          <span className="font-display text-3xl text-muted">+</span>
        </div>
        <p className="mt-4 text-sm text-muted">{dictionary.desk.emptySlot}</p>
      </Link>
    </div>
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
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-4 sm:px-8 lg:flex-row lg:items-start lg:justify-between">
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
              onClick={() =>
                run(() => markCompleted(material.id, getLocalDateString()))
              }
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
        <output className="mx-auto block w-full max-w-6xl px-6 pb-3 font-mono text-xs text-muted sm:px-8">
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
      <div className="relative flex flex-1 items-end pt-8 pb-2 sm:pt-10">
        <DeskAtmosphere />
        <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-end gap-8 px-6 sm:grid-cols-2 sm:px-8 lg:grid-cols-3">
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
