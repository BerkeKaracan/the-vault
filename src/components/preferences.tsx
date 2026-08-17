"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { setColorScheme, setFocusMode } from "@/app/(app)/settings/actions";
import {
  type ColorScheme,
  defaultColorScheme,
  isColorScheme,
} from "@/lib/theme";
import type { AccentColor } from "@/lib/types";

type PreferencesValue = {
  accent: AccentColor;
  dailyGoal: number | null;
  focusMode: boolean;
  colorScheme: ColorScheme;
  toggleFocus: () => void;
  toggleTheme: () => void;
  setTheme: (scheme: ColorScheme) => void;
};

const PreferencesContext = createContext<PreferencesValue | null>(null);

function applyTheme(scheme: ColorScheme, accent: AccentColor) {
  const root = document.documentElement;
  root.dataset.theme = scheme;
  root.dataset.accent = accent;
  root.classList.toggle("dark", scheme === "dark");
}

export function PreferencesProvider({
  accent,
  dailyGoal,
  focusMode,
  colorScheme,
  className = "flex min-h-dvh flex-1 flex-col",
  children,
}: {
  accent: AccentColor;
  dailyGoal: number | null;
  focusMode: boolean;
  colorScheme: ColorScheme;
  className?: string;
  children: ReactNode;
}) {
  const [focused, setFocused] = useState(focusMode);
  const [scheme, setScheme] = useState<ColorScheme>(
    isColorScheme(colorScheme) ? colorScheme : defaultColorScheme,
  );
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setFocused(focusMode);
  }, [focusMode]);

  useEffect(() => {
    setScheme(colorScheme);
  }, [colorScheme]);

  useEffect(() => {
    applyTheme(scheme, accent);
  }, [scheme, accent]);

  useEffect(() => {
    document.documentElement.classList.toggle("focus-private", focused);
    return () => document.documentElement.classList.remove("focus-private");
  }, [focused]);

  const value = useMemo(() => {
    const persistTheme = (next: ColorScheme) => {
      if (pending || next === scheme) return;
      setScheme(next);
      applyTheme(next, accent);
      startTransition(async () => {
        await setColorScheme(next);
      });
    };

    return {
      accent,
      dailyGoal,
      focusMode: focused,
      colorScheme: scheme,
      toggleFocus: () => {
        if (pending) return;
        const next = !focused;
        setFocused(next);
        startTransition(async () => {
          await setFocusMode(next);
        });
      },
      setTheme: persistTheme,
      toggleTheme: () => {
        persistTheme(scheme === "light" ? "dark" : "light");
      },
    };
  }, [accent, dailyGoal, focused, pending, scheme]);

  return (
    <PreferencesContext.Provider value={value}>
      <div
        data-accent={accent}
        data-theme={scheme}
        className={`${focused ? "focus-private" : ""} ${className}`.trim()}
      >
        {children}
      </div>
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    return {
      accent: "emerald" as const,
      dailyGoal: null,
      focusMode: false,
      colorScheme: defaultColorScheme,
      toggleFocus: () => undefined,
      toggleTheme: () => undefined,
      setTheme: () => undefined,
    };
  }
  return ctx;
}
