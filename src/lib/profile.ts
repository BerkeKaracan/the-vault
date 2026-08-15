import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export type SessionProfile = {
  email: string | null;
  profile: Profile | null;
};

/** Read-only. Must not live in a `"use server"` file — those are actions, not render queries. */
export const getSessionProfile = cache(
  async (): Promise<SessionProfile> => {
    try {
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

      if (error) {
        console.error("[getSessionProfile]", error.message);
        return { email: user.email ?? null, profile: null };
      }

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
          console.error("[getSessionProfile]", insertError.message);
          return { email: user.email ?? null, profile: null };
        }

        return { email: user.email ?? null, profile: created };
      }

      return { email: user.email ?? null, profile: data };
    } catch (error) {
      console.error("[getSessionProfile]", error);
      return { email: null, profile: null };
    }
  },
);
