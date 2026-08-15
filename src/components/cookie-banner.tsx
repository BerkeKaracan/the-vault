"use client";

import { useTransition } from "react";
import { useI18n } from "@/i18n/provider";
import { setCookieConsent } from "@/lib/consent-actions";

export function CookieBanner() {
  const { dictionary } = useI18n();
  const [pending, startTransition] = useTransition();

  function choose(value: "necessary" | "all") {
    startTransition(async () => {
      await setCookieConsent(value);
    });
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface/95 px-6 py-4 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <p className="text-sm font-medium text-foreground">
            {dictionary.cookies.title}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            {dictionary.cookies.body}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => choose("necessary")}
            className="rounded-full border border-border px-4 py-2 text-sm text-foreground/80 transition hover:border-foreground/25 hover:text-foreground disabled:opacity-40"
          >
            {dictionary.cookies.necessary}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => choose("all")}
            className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition hover:opacity-90 disabled:opacity-40"
          >
            {dictionary.cookies.acceptAll}
          </button>
        </div>
      </div>
    </div>
  );
}
