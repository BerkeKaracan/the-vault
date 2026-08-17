"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { safeNextPath } from "@/lib/paths";
import { createClient } from "@/lib/supabase/server";

const DEV_EMAIL = "testuser@gmail.com";
const DEV_PASSWORD = "123456";

export async function devSignIn(next?: string) {
  if (process.env.NODE_ENV !== "development") {
    return { ok: false as const };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: DEV_EMAIL,
    password: DEV_PASSWORD,
  });

  if (!error && data.session) {
    revalidatePath("/", "layout");
    redirect(safeNextPath(next));
  }

  const { data: signedUp, error: signUpError } = await supabase.auth.signUp({
    email: DEV_EMAIL,
    password: DEV_PASSWORD,
    options: { data: { full_name: "Test User" } },
  });

  if (signUpError) {
    return { ok: false as const };
  }

  if (!signedUp.session) {
    const second = await supabase.auth.signInWithPassword({
      email: DEV_EMAIL,
      password: DEV_PASSWORD,
    });
    if (second.error || !second.data.session) {
      return { ok: false as const };
    }
  }

  revalidatePath("/", "layout");
  redirect(safeNextPath(next));
}
