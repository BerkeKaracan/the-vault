"use client";

import { useEffect, useState, useTransition } from "react";
import { deleteMaterial, updateMaterial } from "@/app/(app)/materials-actions";
import type { ErrorKey } from "@/i18n/dictionaries";
import { useI18n } from "@/i18n/provider";
import type { Material } from "@/lib/types";

const fieldClass =
  "mt-1.5 w-full rounded-md border border-border bg-elevated px-3 py-2 text-sm text-foreground outline-none focus:border-accent/50";

function translateError(
  dictionary: ReturnType<typeof useI18n>["dictionary"],
  code: string,
) {
  if (code in dictionary.errors) {
    return dictionary.errors[code as ErrorKey];
  }
  return dictionary.errors.generic;
}

export function MaterialEditor({ material }: { material: Material }) {
  const { dictionary } = useI18n();
  const [title, setTitle] = useState(material.title);
  const [totalPages, setTotalPages] = useState(
    material.total_pages != null ? String(material.total_pages) : "",
  );
  const [tags, setTags] = useState(material.tags.join(", "));
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setTitle(material.title);
    setTotalPages(
      material.total_pages != null ? String(material.total_pages) : "",
    );
    setTags(material.tags.join(", "));
  }, [material.title, material.total_pages, material.tags]);

  function onSave(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const totalRaw = totalPages.trim();
    const parsedTotal = totalRaw === "" ? null : Number(totalRaw);

    startTransition(async () => {
      const result = await updateMaterial({
        materialId: material.id,
        title,
        totalPages: parsedTotal,
        tags,
      });
      if (!result.ok) {
        setMessage(translateError(dictionary, result.error ?? "generic"));
        return;
      }
      setMessage(dictionary.book.saved);
    });
  }

  function onDelete() {
    if (!window.confirm(dictionary.book.deleteConfirm)) return;
    setMessage(null);
    startTransition(async () => {
      const result = await deleteMaterial(material.id);
      if (result && !result.ok) {
        setMessage(translateError(dictionary, result.error ?? "generic"));
      }
    });
  }

  return (
    <section className="mt-12 border-t border-border pt-8">
      <h2 className="font-mono text-[0.65rem] tracking-[0.22em] text-muted uppercase">
        {dictionary.book.edit}
      </h2>
      <form onSubmit={onSave} className="mt-4 flex max-w-lg flex-col gap-4">
        <label className="block text-sm text-muted">
          {dictionary.add.titleLabel}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={200}
            className={fieldClass}
          />
        </label>
        <label className="block text-sm text-muted">
          {dictionary.add.totalPagesLabel}
          <input
            type="number"
            min={1}
            value={totalPages}
            onChange={(e) => setTotalPages(e.target.value)}
            className={fieldClass}
          />
        </label>
        <label className="block text-sm text-muted">
          {dictionary.add.tagsLabel}
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder={dictionary.add.tagsPlaceholder}
            className={fieldClass}
          />
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition hover:opacity-90 disabled:opacity-40"
          >
            {dictionary.book.save}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={onDelete}
            className="px-2 text-xs text-muted hover:text-foreground disabled:opacity-40"
          >
            {dictionary.book.delete}
          </button>
          {message ? (
            <output className="text-sm text-muted">{message}</output>
          ) : null}
        </div>
      </form>
    </section>
  );
}
