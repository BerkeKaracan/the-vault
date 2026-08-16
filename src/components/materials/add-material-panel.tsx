"use client";

import { useState, useTransition } from "react";
import { addMaterial } from "@/app/(app)/materials-actions";
import { BookCatalog } from "@/components/books/book-catalog";
import { MetricFields } from "@/components/materials/catalog-fields";
import type { ErrorKey } from "@/i18n/dictionaries";
import { useI18n } from "@/i18n/provider";
import { t } from "@/i18n/t";
import type { GoogleBookResult } from "@/lib/google-books";
import type { MetricType } from "@/lib/types";

type Tab = "search" | "manual";

function translateError(
  dictionary: ReturnType<typeof useI18n>["dictionary"],
  code: string,
) {
  if (code in dictionary.errors) {
    return dictionary.errors[code as ErrorKey];
  }
  return code;
}

export function AddMaterialPanel({
  initialBooks,
}: {
  initialBooks: GoogleBookResult[];
}) {
  const { dictionary } = useI18n();
  const [tab, setTab] = useState<Tab>("search");
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [metricType, setMetricType] = useState<MetricType>("pages");
  const [tags, setTags] = useState("");

  function saveManual(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setActionMessage(null);
    const form = new FormData(e.currentTarget);
    const title = String(form.get("title") ?? "");
    const author = String(form.get("author") ?? "");
    const description = String(form.get("description") ?? "");
    const totalRaw = String(form.get("totalPages") ?? "").trim();
    const status = String(form.get("status") ?? "shelved") as
      | "active"
      | "shelved";
    const totalPages = totalRaw ? Number(totalRaw) : null;

    startTransition(async () => {
      const result = await addMaterial({
        title,
        author: author || null,
        totalPages:
          totalPages && Number.isFinite(totalPages) && totalPages > 0
            ? totalPages
            : null,
        coverUrl: null,
        googleBooksId: null,
        source: "custom",
        status,
        description: description || null,
        metricType,
        tags,
      });
      if (!result.ok) {
        setActionMessage(translateError(dictionary, result.error));
        return;
      }
      setActionMessage(t(dictionary.add.added, { title: title.trim() }));
      e.currentTarget.reset();
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex gap-4 border-b border-border text-sm">
        <button
          type="button"
          onClick={() => setTab("search")}
          className={`pb-3 transition ${
            tab === "search"
              ? "border-b border-foreground text-foreground"
              : "text-muted hover:text-foreground/80"
          }`}
        >
          {dictionary.add.tabSearch}
        </button>
        <button
          type="button"
          onClick={() => setTab("manual")}
          className={`pb-3 transition ${
            tab === "manual"
              ? "border-b border-foreground text-foreground"
              : "text-muted hover:text-foreground/80"
          }`}
        >
          {dictionary.add.tabManual}
        </button>
      </div>

      {actionMessage ? (
        <output className="rounded-md border border-border bg-elevated/80 px-3 py-2 text-sm text-foreground/80">
          {actionMessage}
        </output>
      ) : null}

      <MetricFields
        metricType={metricType}
        onMetricChange={setMetricType}
        tags={tags}
        onTagsChange={setTags}
      />

      {tab === "search" ? (
        <BookCatalog
          initialBooks={initialBooks}
          metricType={metricType}
          tags={tags}
        />
      ) : (
        <form onSubmit={saveManual} className="flex max-w-md flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm text-muted">
            {dictionary.add.titleLabel}
            <input
              name="title"
              required
              className="rounded-md border border-border bg-elevated px-3 py-2 text-foreground outline-none focus:border-accent/50"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-muted">
            {dictionary.add.authorLabel}
            <input
              name="author"
              className="rounded-md border border-border bg-elevated px-3 py-2 text-foreground outline-none focus:border-accent/50"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-muted">
            {dictionary.add.totalPagesLabel}
            <input
              name="totalPages"
              type="number"
              min={1}
              className="rounded-md border border-border bg-elevated px-3 py-2 text-foreground outline-none focus:border-accent/50"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-muted">
            {dictionary.add.descriptionLabel}
            <textarea
              name="description"
              rows={5}
              className="rounded-md border border-border bg-elevated px-3 py-2 text-foreground outline-none focus:border-accent/50"
            />
          </label>
          <fieldset className="flex gap-4 text-sm text-muted">
            <label className="flex items-center gap-2">
              <input type="radio" name="status" value="active" defaultChecked />
              {dictionary.add.statusActive}
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="status" value="shelved" />
              {dictionary.add.statusVault}
            </label>
          </fieldset>
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background disabled:opacity-40"
          >
            {pending ? dictionary.busy : dictionary.add.submit}
          </button>
        </form>
      )}
    </div>
  );
}
