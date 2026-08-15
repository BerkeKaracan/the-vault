import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireUser() {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}
