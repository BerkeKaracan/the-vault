"use server";

import { refresh } from "next/cache";
import { cookies } from "next/headers";
import { isAccentColor } from "@/lib/catalog/fields";
import { createClient } from "@/lib/supabase/server";
import {
  type ColorScheme,
  colorSchemeCookieName,
  isColorScheme,
} from "@/lib/theme";
import type {
  AccentColor,
  ActionResult,
  Profile,
  WeekStart,
} from "@/lib/types";

const WEEK_STARTS = new Set<WeekStart>(["monday", "sunday"]);

async function persistColorSchemeCookie(scheme: ColorScheme) {
  const store = await cookies();
  store.set(colorSchemeCookieName, scheme, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}

export async function updateProfile(input: {
  displayName: string;
  weekStartsOn: WeekStart;
  accentColor: AccentColor;
  dailyGoal: number | null;
  colorScheme: ColorScheme;
}): Promise<ActionResult<Profile>> {
  const displayName = input.displayName.trim().slice(0, 80);
  if (
    !WEEK_STARTS.has(input.weekStartsOn) ||
    !isAccentColor(input.accentColor) ||
    !isColorScheme(input.colorScheme)
  ) {
    return { ok: false, error: "generic" };
  }

  const dailyGoal =
    input.dailyGoal != null &&
    Number.isFinite(input.dailyGoal) &&
    input.dailyGoal > 0
      ? Math.floor(input.dailyGoal)
      : null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "authRequired" };
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName || null,
      week_starts_on: input.weekStartsOn,
      accent_color: input.accentColor,
      daily_goal: dailyGoal,
      color_scheme: input.colorScheme,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    return { ok: false, error: "generic" };
  }
  if (!data) {
    return { ok: false, error: "notFound" };
  }

  await persistColorSchemeCookie(input.colorScheme);
  refresh();
  return { ok: true, data };
}

export async function setFocusMode(
  enabled: boolean,
): Promise<ActionResult<Profile>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "authRequired" };
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({
      focus_mode: enabled,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    return { ok: false, error: "generic" };
  }
  if (!data) {
    return { ok: false, error: "notFound" };
  }

  refresh();
  return { ok: true, data };
}

export async function setGoalReminders(
  enabled: boolean,
): Promise<ActionResult<Profile>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "authRequired" };
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({
      goal_reminders: enabled,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    return { ok: false, error: "generic" };
  }
  if (!data) {
    return { ok: false, error: "notFound" };
  }

  refresh();
  return { ok: true, data };
}

export async function setColorScheme(
  scheme: ColorScheme,
): Promise<ActionResult<ColorScheme>> {
  if (!isColorScheme(scheme)) {
    return { ok: false, error: "generic" };
  }

  await persistColorSchemeCookie(scheme);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { error } = await supabase
      .from("profiles")
      .update({
        color_scheme: scheme,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      return { ok: false, error: "generic" };
    }
  }

  refresh();
  return { ok: true, data: scheme };
}
