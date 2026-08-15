"use client";

import { usePreferences } from "@/components/preferences";
import { useI18n } from "@/i18n/provider";

export function FocusToggle() {
  const { dictionary } = useI18n();
  const { focusMode, toggleFocus } = usePreferences();

  return (
    <button
      type="button"
      onClick={toggleFocus}
      aria-pressed={focusMode}
      className={`rounded-full px-3 py-1.5 font-mono text-[0.65rem] tracking-[0.18em] uppercase transition ${
        focusMode
          ? "bg-white/10 text-zinc-100"
          : "text-zinc-500 hover:text-zinc-200"
      }`}
    >
      {dictionary.nav.focus}
    </button>
  );
}
