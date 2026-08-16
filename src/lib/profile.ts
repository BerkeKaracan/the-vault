import { cache } from "react";
import { getAuthUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

type SessionProfile = {
  email: string | null;
  profile: Profile | null;
};

/** Read-only. Must not live in a `"use server"` file — those are actions, not render queries.
 *  Profile rows are created by the `handle_new_user` trigger (see 007_profile_oauth_display_name.sql).
 */
export const getSessionProfile = cache(async (): Promise<SessionProfile> => {
  try {
    const [supabase, user] = await Promise.all([createClient(), getAuthUser()]);

    if (!user) {
      return { email: null, profile: null };
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("[getSessionProfile]", error.message);
      return { email: user.email ?? null, profile: null };
    }

    return { email: user.email ?? null, profile: data };
  } catch (error) {
    console.error("[getSessionProfile]", error);
    return { email: null, profile: null };
  }
});
