"use server";

import { refresh, revalidatePath } from "next/cache";
import { isAccentColor } from "@/lib/catalog";
import { createClient } from "@/lib/supabase/server";
import { isTimezone } from "@/lib/timezones";
import type {
  AccentColor,
  ActionResult,
  Profile,
  WeekStart,
} from "@/lib/types";

const WEEK_STARTS = new Set<WeekStart>(["monday", "sunday"]);

function revalidateSettingsPaths() {
  revalidatePath("/settings");
  revalidatePath("/desk");
  revalidatePath("/vault");
  revalidatePath("/materials", "layout");
}

export async function getSessionProfile(): Promise<{
  email: string | null;
  profile: Profile | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { email: null, profile: null };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    const fallbackName = user.email?.split("@")[0]?.trim() || null;
    const { data: created, error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        display_name: fallbackName,
      })
      .select()
      .single();

    if (insertError) {
      return { email: user.email ?? null, profile: null };
    }

    return { email: user.email ?? null, profile: created };
  }

  return { email: user.email ?? null, profile: data };
}

export async function updateProfile(input: {
  displayName: string;
  timezone: string;
  weekStartsOn: WeekStart;
  accentColor: AccentColor;
  dailyGoal: number | null;
}): Promise<ActionResult<Profile>> {
  const displayName = input.displayName.trim().slice(0, 80);
  if (
    !isTimezone(input.timezone) ||
    !WEEK_STARTS.has(input.weekStartsOn) ||
    !isAccentColor(input.accentColor)
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
      timezone: input.timezone,
      week_starts_on: input.weekStartsOn,
      accent_color: input.accentColor,
      daily_goal: dailyGoal,
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

  revalidateSettingsPaths();
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

  revalidateSettingsPaths();
  return { ok: true, data };
}
