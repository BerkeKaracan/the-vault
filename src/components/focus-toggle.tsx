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
      aria-label={`${dictionary.nav.focus}. ${dictionary.settings.focusModeHint}`}
      title={dictionary.settings.focusModeHint}
      className={`rounded-full px-3 py-1.5 font-mono text-[0.65rem] tracking-[0.18em] uppercase transition ${
        focusMode
          ? "bg-foreground/8 text-foreground"
          : "text-muted hover:text-foreground"
      }`}
    >
      {dictionary.nav.focus}
    </button>
  );
}
