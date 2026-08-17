import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getLocalDateString } from "@/lib/local-date";
import { createClient } from "@/lib/supabase/server";

function readDay(value: string | null): string {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return getLocalDateString();
}

export async function GET(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "authRequired" }, { status: 401 });
  }

  const today = readDay(new URL(request.url).searchParams.get("d"));
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("progress_entries")
    .select("pages_delta")
    .eq("user_id", user.id)
    .eq("logged_on", today);

  if (error) {
    return NextResponse.json({ pages: 0, date: today });
  }

  const pages = (data ?? []).reduce((sum, row) => sum + row.pages_delta, 0);
  return NextResponse.json({ pages, date: today });
}
