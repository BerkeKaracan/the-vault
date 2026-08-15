"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isTimezone } from "@/lib/timezones";
import type { ActionResult, Profile, WeekStart } from "@/lib/types";

const WEEK_STARTS = new Set<WeekStart>(["monday", "sunday"]);

function revalidateSettingsPaths() {
  revalidatePath("/settings");
  revalidatePath("/desk");
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
}): Promise<ActionResult<Profile>> {
  const displayName = input.displayName.trim().slice(0, 80);
  if (!isTimezone(input.timezone) || !WEEK_STARTS.has(input.weekStartsOn)) {
    return { ok: false, error: "generic" };
  }

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
