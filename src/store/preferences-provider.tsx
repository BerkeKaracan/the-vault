"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
} from "react";
import { useStore } from "zustand";
import { defaultColorScheme } from "@/lib/theme";
import {
  applyTheme,
  createPreferencesStore,
  type PreferencesSnapshot,
  type PreferencesState,
  type PreferencesStore,
} from "@/store/preferences";

const PreferencesStoreContext = createContext<PreferencesStore | null>(null);

const fallbackStore = createPreferencesStore({
  accent: "emerald",
  dailyGoal: null,
  focusMode: false,
  colorScheme: defaultColorScheme,
});

export function PreferencesProvider({
  accent,
  dailyGoal,
  focusMode,
  colorScheme,
  className = "flex min-h-dvh flex-1 flex-col",
  children,
}: PreferencesSnapshot & {
  className?: string;
  children: ReactNode;
}) {
  const storeRef = useRef<PreferencesStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = createPreferencesStore({
      accent,
      dailyGoal,
      focusMode,
      colorScheme,
    });
  }

  const store = storeRef.current;

  useEffect(() => {
    store.getState().hydrate({ accent, dailyGoal, focusMode, colorScheme });
  }, [store, accent, dailyGoal, focusMode, colorScheme]);

  const scheme = useStore(store, (state) => state.colorScheme);
  const focused = useStore(store, (state) => state.focusMode);
  const currentAccent = useStore(store, (state) => state.accent);

  useEffect(() => {
    applyTheme(scheme, currentAccent);
  }, [scheme, currentAccent]);

  useEffect(() => {
    document.documentElement.classList.toggle("focus-private", focused);
    return () => document.documentElement.classList.remove("focus-private");
  }, [focused]);

  return (
    <PreferencesStoreContext.Provider value={store}>
      <div
        data-accent={currentAccent}
        data-theme={scheme}
        className={`${focused ? "focus-private" : ""} ${className}`.trim()}
      >
        {children}
      </div>
    </PreferencesStoreContext.Provider>
  );
}

export function usePreferences(): PreferencesState;
export function usePreferences<T>(selector: (state: PreferencesState) => T): T;
export function usePreferences<T>(
  selector?: (state: PreferencesState) => T,
): T | PreferencesState {
  const store = useContext(PreferencesStoreContext) ?? fallbackStore;
  return useStore(store, selector ?? ((state) => state as T));
}
