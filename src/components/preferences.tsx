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
import { setFocusMode } from "@/app/(app)/settings-actions";
import type { AccentColor } from "@/lib/types";

type PreferencesValue = {
  accent: AccentColor;
  dailyGoal: number | null;
  focusMode: boolean;
  toggleFocus: () => void;
};

const PreferencesContext = createContext<PreferencesValue | null>(null);

export function PreferencesProvider({
  accent,
  dailyGoal,
  focusMode,
  className = "",
  children,
}: {
  accent: AccentColor;
  dailyGoal: number | null;
  focusMode: boolean;
  className?: string;
  children: ReactNode;
}) {
  const [focused, setFocused] = useState(focusMode);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setFocused(focusMode);
  }, [focusMode]);

  useEffect(() => {
    document.documentElement.dataset.accent = accent;
  }, [accent]);

  useEffect(() => {
    document.documentElement.classList.toggle("focus-private", focused);
    return () => document.documentElement.classList.remove("focus-private");
  }, [focused]);

  const value = useMemo(
    () => ({
      accent,
      dailyGoal,
      focusMode: focused,
      toggleFocus: () => {
        if (pending) return;
        const next = !focused;
        setFocused(next);
        startTransition(async () => {
          await setFocusMode(next);
        });
      },
    }),
    [accent, dailyGoal, focused, pending],
  );

  return (
    <PreferencesContext.Provider value={value}>
      <div
        data-accent={accent}
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
      toggleFocus: () => undefined,
    };
  }
  return ctx;
}
