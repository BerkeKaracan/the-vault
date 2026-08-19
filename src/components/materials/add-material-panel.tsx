"use client";

import { useEffect, useRef, useState } from "react";
import { addMaterial } from "@/app/(app)/materials/[id]/actions";
import { BookCatalog } from "@/components/books/book-catalog";
import { MetricFields } from "@/components/materials/catalog-fields";
import type { ErrorKey } from "@/i18n/dictionaries";
import { useI18n } from "@/i18n/provider";
import { t } from "@/i18n/t";
import type { GoogleBooksPage } from "@/lib/catalog/google-books";
import { COVER_MAX_BYTES, coverExtensionFor } from "@/lib/cover";
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
  initialPage,
}: {
  initialPage: GoogleBooksPage;
}) {
  const { dictionary } = useI18n();
  const [tab, setTab] = useState<Tab>("search");
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [metricType, setMetricType] = useState<MetricType>("pages");
  const [tags, setTags] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverNonce, setCoverNonce] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!coverFile) {
      setCoverPreview(null);
      return;
    }
    const url = URL.createObjectURL(coverFile);
    setCoverPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [coverFile]);

  async function saveManual(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = formRef.current ?? e.currentTarget;
    if (!formEl) return;
    setActionMessage(null);
    const form = new FormData(formEl);
    const title = String(form.get("title") ?? "");
    const author = String(form.get("author") ?? "");
    const description = String(form.get("description") ?? "");
    const totalRaw = String(form.get("totalPages") ?? "").trim();
    const status = String(form.get("status") ?? "shelved") as
      | "active"
      | "shelved";
    const totalPages = totalRaw ? Number(totalRaw) : null;

    setPending(true);
    try {
      let coverUrl: string | null = null;
      if (coverFile) {
        if (coverFile.size > COVER_MAX_BYTES) {
          setActionMessage(dictionary.errors.coverTooLarge);
          return;
        }
        if (!coverExtensionFor(coverFile.type, coverFile.name)) {
          setActionMessage(dictionary.errors.coverType);
          return;
        }
        const payload = new FormData();
        payload.set("file", coverFile);
        const response = await fetch("/api/covers", {
          method: "POST",
          body: payload,
          credentials: "same-origin",
        });
        const uploaded = (await response.json()) as {
          url?: string;
          error?: string;
        };
        if (!response.ok || !uploaded.url) {
          setActionMessage(
            translateError(dictionary, uploaded.error ?? "coverFailed"),
          );
          return;
        }
        coverUrl = uploaded.url;
      }

      const result = await addMaterial({
        title,
        author: author || null,
        totalPages:
          totalPages && Number.isFinite(totalPages) && totalPages > 0
            ? totalPages
            : null,
        coverUrl,
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
      setCoverFile(null);
      setCoverNonce((n) => n + 1);
      formRef.current?.reset();
    } catch {
      setActionMessage(dictionary.errors.generic);
    } finally {
      setPending(false);
    }
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
          initialPage={initialPage}
          metricType={metricType}
          tags={tags}
        />
      ) : (
        <form
          ref={formRef}
          onSubmit={saveManual}
          className="flex max-w-md flex-col gap-4"
        >
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
          <label className="flex flex-col gap-1.5 text-sm text-muted">
            {dictionary.add.coverLabel}
            <input
              key={coverNonce}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/*"
              className="rounded-md border border-border bg-elevated px-3 py-2 text-foreground file:mr-3 file:rounded-full file:border-0 file:bg-foreground/10 file:px-3 file:py-1 file:text-xs outline-none focus:border-accent/50"
              onChange={(event) => {
                setCoverFile(event.target.files?.[0] ?? null);
              }}
            />
            <span className="text-xs text-muted">
              {dictionary.add.coverHint}
            </span>
          </label>
          {coverPreview ? (
            <div className="flex items-start gap-3">
              {/* biome-ignore lint/performance/noImgElement: blob preview is not a remote image */}
              <img
                src={coverPreview}
                alt=""
                className="h-28 w-20 rounded-md object-cover ring-1 ring-border"
              />
              <button
                type="button"
                onClick={() => {
                  setCoverFile(null);
                  setCoverNonce((n) => n + 1);
                }}
                className="text-xs text-muted underline-offset-2 hover:text-foreground hover:underline"
              >
                {dictionary.add.coverRemove}
              </button>
            </div>
          ) : null}
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
            className="rounded-full bg-accent px-3 py-2 text-sm font-medium text-accent-fg transition hover:opacity-90 disabled:opacity-40"
          >
            {pending
              ? coverFile
                ? dictionary.add.coverUploading
                : dictionary.busy
              : dictionary.add.submit}
          </button>
        </form>
      )}
    </div>
  );
}
