"use client";

import { useState, useTransition } from "react";
import { upsertMaterialNote } from "@/app/(app)/materials-actions";
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
    <section className="mt-12 border-t border-white/8 pt-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-mono text-[0.65rem] tracking-[0.22em] text-zinc-500 uppercase">
            {dictionary.book.notes}
          </h2>
          <p className="mt-1 text-xs text-zinc-600">
            {dictionary.book.notesHint}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPreview((value) => !value)}
          className="font-mono text-[0.62rem] tracking-wide text-zinc-500 uppercase hover:text-zinc-300"
        >
          {preview ? dictionary.book.notesEdit : dictionary.book.notesPreview}
        </button>
      </div>

      {preview ? (
        <div
          className="note-body mt-4 max-w-3xl text-sm leading-relaxed text-zinc-300"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: renderMarkdown escapes HTML first
          dangerouslySetInnerHTML={{ __html: renderMarkdown(body) }}
        />
      ) : (
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={10}
          placeholder={dictionary.book.notesPlaceholder}
          className="mt-4 w-full max-w-3xl rounded-md border border-white/10 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-100 outline-none focus:border-accent/50"
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
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg disabled:opacity-40"
        >
          {dictionary.book.notesSave}
        </button>
        {message ? (
          <output className="text-sm text-zinc-500">{message}</output>
        ) : null}
      </div>
    </section>
  );
}
