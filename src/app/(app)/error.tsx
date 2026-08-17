"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useI18n } from "@/i18n/provider";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { dictionary } = useI18n();

  useEffect(() => {
    console.error("[app]", error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-20 sm:px-8">
      <p className="font-mono text-[0.62rem] tracking-[0.22em] text-muted uppercase">
        {dictionary.brand}
      </p>
      <h1 className="mt-3 font-display text-2xl font-semibold tracking-[-0.03em] text-foreground">
        {dictionary.errorPage.title}
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
        {dictionary.errorPage.body}
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg transition hover:opacity-90"
        >
          {dictionary.errorPage.retry}
        </button>
        <Link
          href="/desk"
          className="rounded-full border border-border px-5 py-2.5 text-sm text-foreground/80 transition hover:border-foreground/25 hover:text-foreground"
        >
          {dictionary.errorPage.backToDesk}
        </Link>
      </div>
      {error.digest ? (
        <p className="mt-8 font-mono text-[0.62rem] text-muted">
          {error.digest}
        </p>
      ) : null}
    </main>
  );
}
