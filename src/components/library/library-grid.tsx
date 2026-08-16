"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import {
  createCollection,
  deleteCollection,
} from "@/app/(app)/collection-actions";
import { activateMaterial } from "@/app/(app)/materials-actions";
import { Cover } from "@/components/materials/cover";
import { TagList } from "@/components/materials/tag-list";
import type { ErrorKey } from "@/i18n/dictionaries";
import { useI18n } from "@/i18n/provider";
import type { Collection } from "@/lib/collections";
import type { Material, MaterialStatus } from "@/lib/types";

function translateError(
  dictionary: ReturnType<typeof useI18n>["dictionary"],
  code: string,
) {
  if (code in dictionary.errors) {
    return dictionary.errors[code as ErrorKey];
  }
  return dictionary.errors.generic;
}

type StatusFilter = "all" | MaterialStatus;
type SortKey = "updated" | "title" | "progress";

function progressOf(material: Material): number {
  if (!material.total_pages || material.total_pages <= 0) return 0;
  return material.current_page / material.total_pages;
}

export function LibraryGrid({
  materials,
  collections,
}: {
  materials: Material[];
  collections: Collection[];
}) {
  const { dictionary, locale } = useI18n();
  const [message, setMessage] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [shelfId, setShelfId] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("updated");
  const [newShelf, setNewShelf] = useState("");

  const shelfIds = useMemo(() => {
    if (!shelfId) return null;
    const shelf = collections.find((item) => item.id === shelfId);
    return new Set(shelf?.materialIds ?? []);
  }, [collections, shelfId]);

  const visible = useMemo(() => {
    const q = query.trim().toLocaleLowerCase(locale);
    let list = materials;
    if (status !== "all") {
      list = list.filter((item) => item.status === status);
    }
    if (shelfIds) {
      list = list.filter((item) => shelfIds.has(item.id));
    }
    if (q) {
      list = list.filter((item) => {
        const title = item.title.toLocaleLowerCase(locale);
        const author = (item.author ?? "").toLocaleLowerCase(locale);
        return title.includes(q) || author.includes(q);
      });
    }
    if (sort === "title") {
      return [...list].sort((a, b) => a.title.localeCompare(b.title, locale));
    }
    if (sort === "progress") {
      return [...list].sort((a, b) => progressOf(b) - progressOf(a));
    }
    return list;
  }, [materials, status, shelfIds, query, sort, locale]);

  const statusChips: { id: StatusFilter; label: string }[] = [
    { id: "all", label: dictionary.vault.filterAll },
    { id: "active", label: dictionary.vault.statusActive },
    { id: "shelved", label: dictionary.vault.statusShelved },
    { id: "completed", label: dictionary.vault.statusCompleted },
  ];

  function statusLabel(material: Material) {
    if (material.status === "active") return dictionary.vault.statusActive;
    if (material.status === "completed")
      return dictionary.vault.statusCompleted;
    return dictionary.vault.statusShelved;
  }

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
          href="/discover"
          className="mt-7 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-fg transition hover:opacity-90"
        >
          {dictionary.vault.emptyCta}
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[13rem_minmax(0,1fr)]">
      <aside className="flex flex-col gap-3">
        <p className="font-mono text-[0.62rem] tracking-[0.22em] text-muted uppercase">
          {dictionary.vault.shelvesTitle}
        </p>
        <button
          type="button"
          onClick={() => setShelfId(null)}
          className={`rounded-full border px-2.5 py-1 text-left font-mono text-[0.62rem] tracking-wide uppercase ${
            shelfId === null
              ? "border-foreground/25 bg-foreground/8 text-foreground"
              : "border-border text-muted hover:text-foreground/80"
          }`}
        >
          {dictionary.vault.filterAll}
        </button>
        {collections.map((shelf) => (
          <div key={shelf.id} className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShelfId(shelf.id)}
              className={`min-w-0 flex-1 truncate rounded-full border px-2.5 py-1 text-left text-xs ${
                shelfId === shelf.id
                  ? "border-foreground/25 bg-foreground/8 text-foreground"
                  : "border-border text-muted hover:text-foreground/80"
              }`}
            >
              {shelf.name}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                if (!window.confirm(dictionary.vault.shelfDelete)) return;
                startTransition(async () => {
                  const result = await deleteCollection(shelf.id);
                  if (!result.ok) {
                    setMessage(translateError(dictionary, result.error));
                    return;
                  }
                  if (shelfId === shelf.id) setShelfId(null);
                });
              }}
              className="px-1 text-[0.65rem] text-muted hover:text-foreground"
            >
              ×
            </button>
          </div>
        ))}
        <form
          className="mt-2 flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const name = newShelf.trim();
            if (!name) return;
            startTransition(async () => {
              const result = await createCollection(name);
              if (!result.ok) {
                setMessage(translateError(dictionary, result.error));
                return;
              }
              setNewShelf("");
            });
          }}
        >
          <input
            value={newShelf}
            onChange={(e) => setNewShelf(e.target.value)}
            placeholder={dictionary.vault.shelfName}
            className="rounded-md border border-border bg-elevated px-2 py-1.5 text-xs text-foreground outline-none focus:border-accent/50"
          />
          <button
            type="submit"
            disabled={pending || newShelf.trim().length === 0}
            className="rounded-full border border-border px-2.5 py-1 font-mono text-[0.62rem] tracking-wide text-muted uppercase hover:text-foreground disabled:opacity-40"
          >
            {dictionary.vault.shelfCreate}
          </button>
        </form>
      </aside>

      <div>
        <div className="flex flex-col gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={dictionary.vault.searchPlaceholder}
            className="w-full rounded-md border border-border bg-elevated px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted focus:border-accent/50"
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-1.5">
              {statusChips.map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setStatus(chip.id)}
                  className={`rounded-full border px-2.5 py-1 font-mono text-[0.62rem] tracking-wide uppercase ${
                    status === chip.id
                      ? "border-foreground/25 bg-foreground/8 text-foreground"
                      : "border-border text-muted hover:text-foreground/80"
                  }`}
                >
                  {chip.label}
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
                <option value="progress">
                  {dictionary.vault.sortProgress}
                </option>
              </select>
            </label>
          </div>
        </div>

        {message ? (
          <output className="mt-4 block text-sm text-muted">{message}</output>
        ) : null}

        {visible.length === 0 ? (
          <p className="mt-8 text-sm text-muted">
            {dictionary.vault.shelfEmpty}
          </p>
        ) : (
          <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
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
                  {statusLabel(material)}
                </p>
                <div className="mt-2">
                  <TagList tags={material.tags} />
                </div>
                {material.status !== "active" ? (
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
                    className="mt-2 self-start rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-fg transition hover:opacity-90 disabled:opacity-40"
                  >
                    {pending && pendingId === material.id
                      ? dictionary.busy
                      : dictionary.vault.activate}
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
