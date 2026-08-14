"use client";

import { useTransition } from "react";
import { setLocale } from "./actions";
import type { Locale } from "./config";
import { useI18n } from "./provider";

export function LanguageSwitcher() {
  const { locale, dictionary } = useI18n();
  const [pending, startTransition] = useTransition();

  function switchTo(next: Locale) {
    if (next === locale) return;
    startTransition(async () => {
      await setLocale(next);
    });
  }

  return (
    <nav
      className="flex items-center gap-1 font-mono text-xs tracking-wide text-zinc-600"
      aria-label={dictionary.language.label}
    >
      <button
        type="button"
        disabled={pending}
        onClick={() => switchTo("tr")}
        className={
          locale === "tr"
            ? "text-zinc-200"
            : "hover:text-zinc-400 disabled:opacity-40"
        }
      >
        {dictionary.language.tr}
      </button>
      <span className="text-zinc-800">/</span>
      <button
        type="button"
        disabled={pending}
        onClick={() => switchTo("en")}
        className={
          locale === "en"
            ? "text-zinc-200"
            : "hover:text-zinc-400 disabled:opacity-40"
        }
      >
        {dictionary.language.en}
      </button>
    </nav>
  );
}
