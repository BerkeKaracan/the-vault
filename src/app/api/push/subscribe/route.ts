import { NextResponse } from "next/server";
import { getLocale } from "@/i18n/get-dictionary";
import { getAuthUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type SubscribeBody = {
  endpoint?: string;
  keys?: { p256dh?: string; auth?: string };
};

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "authRequired" }, { status: 401 });
  }

  const body = (await request.json()) as SubscribeBody;
  const endpoint = body.endpoint?.trim() ?? "";
  const p256dh = body.keys?.p256dh?.trim() ?? "";
  const auth = body.keys?.auth?.trim() ?? "";
  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ error: "generic" }, { status: 400 });
  }

  const [supabase, locale] = await Promise.all([createClient(), getLocale()]);
  const { error } = await supabase.from("push_subscriptions").upsert({
    endpoint,
    user_id: user.id,
    p256dh,
    auth,
    locale,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("[push/subscribe]", error.message);
    return NextResponse.json({ error: "generic" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "authRequired" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    endpoint?: string;
  };
  const supabase = await createClient();
  let query = supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", user.id);
  if (body.endpoint) {
    query = query.eq("endpoint", body.endpoint);
  }
  await query;
  return NextResponse.json({ ok: true });
}
