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
  const { dictionary } = useI18n();
  const [message, setMessage] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("updated");

  const tags = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    for (const material of materials) {
      for (const tag of material.tags) {
        const key = tag.toLocaleLowerCase("tr");
        if (seen.has(key)) continue;
        seen.add(key);
        list.push(tag);
      }
    }
    return list.sort((a, b) => a.localeCompare(b, "tr"));
  }, [materials]);

  const visible = useMemo(() => {
    const filtered = tagFilter
      ? materials.filter((material) =>
          material.tags.some(
            (tag) =>
              tag.toLocaleLowerCase("tr") === tagFilter.toLocaleLowerCase("tr"),
          ),
        )
      : materials;
    if (sort === "title") {
      return [...filtered].sort((a, b) => a.title.localeCompare(b.title, "tr"));
    }
    return filtered;
  }, [materials, tagFilter, sort]);

  if (materials.length === 0) {
    return (
      <div className="mt-8 rounded-lg border border-dashed border-zinc-800 px-6 py-16 text-center text-sm text-zinc-600">
        {dictionary.vault.empty}
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
                ? "border-white/25 bg-white/8 text-zinc-100"
                : "border-white/10 text-zinc-500 hover:text-zinc-300"
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
                  ? "border-white/25 bg-white/8 text-zinc-100"
                  : "border-white/10 text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 font-mono text-[0.62rem] tracking-wide text-zinc-500 uppercase">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-md border border-white/10 bg-zinc-950 px-2 py-1 text-zinc-300 outline-none"
          >
            <option value="updated">{dictionary.vault.sortUpdated}</option>
            <option value="title">{dictionary.vault.sortTitle}</option>
          </select>
        </label>
      </div>

      {message ? (
        <output className="mt-4 block text-sm text-zinc-500">{message}</output>
      ) : null}
      <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {visible.map((material) => (
          <li key={material.id} className="group relative">
            <Link href={`/materials/${material.id}`} className="block">
              <Cover
                title={material.title}
                author={material.author}
                coverUrl={material.cover_url}
              />
            </Link>
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 opacity-0 transition group-hover:pointer-events-auto group-hover:opacity-100">
              <Link
                href={`/materials/${material.id}`}
                data-private
                className="line-clamp-2 text-sm font-medium text-zinc-100 hover:text-white"
              >
                {material.title}
              </Link>
              <p className="mt-1 font-mono text-[0.65rem] tracking-wide text-zinc-400 uppercase">
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
                className="mt-2 rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-950 disabled:opacity-40"
              >
                {pending && pendingId === material.id
                  ? "…"
                  : dictionary.vault.activate}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
