import { createStore } from "zustand/vanilla";
import { setColorScheme, setFocusMode } from "@/app/(app)/settings/actions";
import {
  type ColorScheme,
  defaultColorScheme,
  isColorScheme,
} from "@/lib/theme";
import type { AccentColor } from "@/lib/types";

export type PreferencesSnapshot = {
  accent: AccentColor;
  dailyGoal: number | null;
  focusMode: boolean;
  colorScheme: ColorScheme;
};

export type PreferencesState = PreferencesSnapshot & {
  hydrate: (snapshot: PreferencesSnapshot) => void;
  toggleFocus: () => void;
  setTheme: (scheme: ColorScheme) => void;
  toggleTheme: () => void;
};

export function applyTheme(scheme: ColorScheme, accent: AccentColor) {
  const root = document.documentElement;
  root.dataset.theme = scheme;
  root.dataset.accent = accent;
  root.classList.toggle("dark", scheme === "dark");
}

function normalizeScheme(scheme: ColorScheme): ColorScheme {
  return isColorScheme(scheme) ? scheme : defaultColorScheme;
}

export function createPreferencesStore(initial: PreferencesSnapshot) {
  return createStore<PreferencesState>()((set, get) => ({
    accent: initial.accent,
    dailyGoal: initial.dailyGoal,
    focusMode: initial.focusMode,
    colorScheme: normalizeScheme(initial.colorScheme),
    hydrate: (snapshot) => {
      set({
        accent: snapshot.accent,
        dailyGoal: snapshot.dailyGoal,
        focusMode: snapshot.focusMode,
        colorScheme: normalizeScheme(snapshot.colorScheme),
      });
    },
    toggleFocus: () => {
      const next = !get().focusMode;
      set({ focusMode: next });
      void setFocusMode(next);
    },
    setTheme: (scheme) => {
      if (scheme === get().colorScheme) return;
      set({ colorScheme: scheme });
      applyTheme(scheme, get().accent);
      void setColorScheme(scheme);
    },
    toggleTheme: () => {
      const next = get().colorScheme === "light" ? "dark" : "light";
      get().setTheme(next);
    },
  }));
}

export type PreferencesStore = ReturnType<typeof createPreferencesStore>;
