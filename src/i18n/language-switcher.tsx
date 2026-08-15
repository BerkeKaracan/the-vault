"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setLocale } from "./actions";
import type { Locale } from "./config";
import { useI18n } from "./provider";

export function LanguageSwitcher() {
  const { locale, dictionary } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function switchTo(next: Locale) {
    if (next === locale) return;
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  return (
    <nav
      className="flex items-center gap-1 font-mono text-xs tracking-wide text-muted"
      aria-label={dictionary.language.label}
    >
      <button
        type="button"
        disabled={pending}
        onClick={() => switchTo("tr")}
        className={
          locale === "tr"
            ? "text-foreground"
            : "hover:text-muted disabled:opacity-40"
        }
      >
        {dictionary.language.tr}
      </button>
      <span className="text-border">/</span>
      <button
        type="button"
        disabled={pending}
        onClick={() => switchTo("en")}
        className={
          locale === "en"
            ? "text-foreground"
            : "hover:text-muted disabled:opacity-40"
        }
      >
        {dictionary.language.en}
      </button>
    </nav>
  );
}
