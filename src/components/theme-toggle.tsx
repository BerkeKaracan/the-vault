"use client";

import { useI18n } from "@/i18n/provider";
import { usePreferences } from "@/store";

export function ThemeToggle() {
  const { dictionary } = useI18n();
  const colorScheme = usePreferences((state) => state.colorScheme);
  const toggleTheme = usePreferences((state) => state.toggleTheme);
  const light = colorScheme === "light";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-pressed={light}
      className={`rounded-full px-3 py-1.5 font-mono text-[0.65rem] tracking-[0.18em] uppercase transition ${
        light
          ? "bg-foreground/8 text-foreground"
          : "text-muted hover:text-foreground"
      }`}
    >
      {light ? dictionary.settings.themeLight : dictionary.settings.themeDark}
    </button>
  );
}
