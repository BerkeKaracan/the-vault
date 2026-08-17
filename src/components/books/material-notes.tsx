"use client";

import { useState, useTransition } from "react";
import { upsertMaterialNote } from "@/app/(app)/materials/[id]/actions";
import type { ErrorKey } from "@/i18n/dictionaries";
import { useI18n } from "@/i18n/provider";
import { renderMarkdown } from "@/lib/markdown";

export function MaterialNotes({
  materialId,
  initialBody,
}: {
  materialId: string;
  initialBody: string;
}) {
  const { dictionary } = useI18n();
  const [body, setBody] = useState(initialBody);
  const [preview, setPreview] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <section className="mt-12 border-t border-border pt-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-mono text-[0.65rem] tracking-[0.22em] text-muted uppercase">
            {dictionary.book.notes}
          </h2>
          <p className="mt-1 text-xs text-muted">{dictionary.book.notesHint}</p>
        </div>
        <button
          type="button"
          onClick={() => setPreview((value) => !value)}
          className="font-mono text-[0.62rem] tracking-wide text-muted uppercase hover:text-foreground/80"
        >
          {preview ? dictionary.book.notesEdit : dictionary.book.notesPreview}
        </button>
      </div>

      {preview ? (
        <div
          className="note-body mt-4 max-w-3xl text-sm leading-relaxed text-foreground/80"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: renderMarkdown escapes HTML first
          dangerouslySetInnerHTML={{ __html: renderMarkdown(body) }}
        />
      ) : (
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={10}
          placeholder={dictionary.book.notesPlaceholder}
          className="mt-4 w-full max-w-3xl rounded-md border border-border bg-elevated px-3 py-2 font-mono text-sm text-foreground outline-none focus:border-accent/50"
        />
      )}

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setMessage(null);
            startTransition(async () => {
              const result = await upsertMaterialNote({
                materialId,
                body,
              });
              if (!result.ok) {
                setMessage(
                  result.error in dictionary.errors
                    ? dictionary.errors[result.error as ErrorKey]
                    : dictionary.errors.generic,
                );
                return;
              }
              setMessage(dictionary.book.notesSaved);
            });
          }}
          className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition hover:opacity-90 disabled:opacity-40"
        >
          {dictionary.book.notesSave}
        </button>
        {message ? (
          <output className="text-sm text-muted">{message}</output>
        ) : null}
      </div>
    </section>
  );
}
