"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { activateMaterial } from "@/app/(app)/materials-actions";
import { Cover } from "@/components/materials/cover";
import { TagList } from "@/components/materials/tag-list";
import type { ErrorKey } from "@/i18n/dictionaries";
import { useI18n } from "@/i18n/provider";
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

type SortKey = "updated" | "title";

export function VaultGrid({ materials }: { materials: Material[] }) {
  const { dictionary, locale } = useI18n();
  const [message, setMessage] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("updated");

  const tags = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    for (const material of materials) {
      for (const tag of material.tags ?? []) {
        const key = tag.toLocaleLowerCase("tr");
        if (seen.has(key)) continue;
        seen.add(key);
        list.push(tag);
      }
    }
    return list.sort((a, b) => a.localeCompare(b, locale));
  }, [materials, locale]);

  const visible = useMemo(() => {
    const filtered = tagFilter
      ? materials.filter((material) =>
          (material.tags ?? []).some(
            (tag) =>
              tag.toLocaleLowerCase("tr") === tagFilter.toLocaleLowerCase("tr"),
          ),
        )
      : materials;
    if (sort === "title") {
      return [...filtered].sort((a, b) =>
        a.title.localeCompare(b.title, locale),
      );
    }
    return filtered;
  }, [materials, tagFilter, sort, locale]);

  if (materials.length === 0) {
    return (
      <div className="mt-8 rounded-lg border border-dashed border-border px-6 py-16 text-center">
        <h2 className="font-display text-xl font-semibold tracking-[-0.03em] text-foreground">
          {dictionary.vault.emptyTitle}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {dictionary.vault.emptyBody}
        </p>
        <Link
          href="/add"
          className="mt-7 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-fg transition hover:opacity-90"
        >
          {dictionary.vault.emptyCta}
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setTagFilter(null)}
            className={`rounded-full border px-2.5 py-1 font-mono text-[0.62rem] tracking-wide uppercase ${
              tagFilter === null
                ? "border-foreground/25 bg-foreground/8 text-foreground"
                : "border-border text-muted hover:text-foreground/80"
            }`}
          >
            {dictionary.vault.filterAll}
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setTagFilter(tag)}
              className={`rounded-full border px-2.5 py-1 font-mono text-[0.62rem] tracking-wide ${
                tagFilter === tag
                  ? "border-foreground/25 bg-foreground/8 text-foreground"
                  : "border-border text-muted hover:text-foreground/80"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 font-mono text-[0.62rem] tracking-wide text-muted uppercase">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-md border border-border bg-elevated px-2 py-1 text-foreground/80 outline-none"
          >
            <option value="updated">{dictionary.vault.sortUpdated}</option>
            <option value="title">{dictionary.vault.sortTitle}</option>
          </select>
        </label>
      </div>

      {message ? (
        <output className="mt-4 block text-sm text-muted">{message}</output>
      ) : null}
      <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {visible.map((material) => (
          <li key={material.id} className="flex flex-col">
            <Link href={`/materials/${material.id}`} className="block">
              <Cover
                title={material.title}
                author={material.author}
                coverUrl={material.cover_url}
              />
            </Link>
            <Link
              href={`/materials/${material.id}`}
              data-private
              className="mt-3 line-clamp-2 font-display text-sm leading-snug font-semibold tracking-[-0.02em] text-foreground hover:text-foreground"
            >
              {material.title}
            </Link>
            <p className="mt-1 font-mono text-[0.65rem] tracking-wide text-muted uppercase">
              {material.status === "completed"
                ? dictionary.vault.statusCompleted
                : dictionary.vault.statusShelved}
            </p>
            <div className="mt-2">
              <TagList tags={material.tags} />
            </div>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                setMessage(null);
                setPendingId(material.id);
                startTransition(async () => {
                  const result = await activateMaterial(material.id);
                  setPendingId(null);
                  if (!result.ok) {
                    setMessage(translateError(dictionary, result.error));
                  }
                });
              }}
              className="mt-2 self-start rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background disabled:opacity-40"
            >
              {pending && pendingId === material.id
                ? dictionary.busy
                : dictionary.vault.activate}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
