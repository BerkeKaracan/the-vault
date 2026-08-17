import { NextResponse } from "next/server";
import {
  type GoalReminderSlot,
  slotForHour,
  zonedClock,
} from "@/lib/goal-reminders";
import { reminderCopy, sendPush } from "@/lib/push";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  return POST(request);
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "authRequired" }, { status: 401 });
  }

  const admin = createServiceClient();
  if (!admin) {
    return NextResponse.json({ error: "generic" }, { status: 500 });
  }

  const [{ data: profiles, error: profileError }, { data: subs }] =
    await Promise.all([
      admin
        .from("profiles")
        .select("id, daily_goal, timezone")
        .eq("goal_reminders", true)
        .not("daily_goal", "is", null),
      admin
        .from("push_subscriptions")
        .select("endpoint, user_id, p256dh, auth, locale"),
    ]);

  if (profileError) {
    console.error("[cron/goal-reminders]", profileError.message);
    return NextResponse.json({ error: "generic" }, { status: 500 });
  }

  const byUser = new Map<string, NonNullable<typeof subs>>();
  for (const sub of subs ?? []) {
    const list = byUser.get(sub.user_id) ?? [];
    list.push(sub);
    byUser.set(sub.user_id, list);
  }

  let sent = 0;

  for (const profile of profiles ?? []) {
    const goal = profile.daily_goal;
    if (goal == null || goal <= 0) continue;
    const clock = zonedClock(profile.timezone);
    const slot = slotForHour(clock.hour);
    if (!slot) continue;

    const claimed = await claimSlot(admin, profile.id, clock.date, slot);
    if (!claimed) continue;

    const { data: rows } = await admin
      .from("progress_entries")
      .select("pages_delta")
      .eq("user_id", profile.id)
      .eq("logged_on", clock.date);

    const today = (rows ?? []).reduce((sum, row) => sum + row.pages_delta, 0);
    if (today >= goal) continue;

    const userSubs = byUser.get(profile.id) ?? [];
    for (const sub of userSubs) {
      const copy = reminderCopy(sub.locale, slot, goal, today);
      const result = await sendPush(
        { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
        {
          title: copy.title,
          body: copy.body,
          url: "/desk",
          tag: `vault-goal-${slot}-${clock.date}`,
          actionTitle: copy.actionTitle,
        },
      );
      if (result === "gone") {
        await admin
          .from("push_subscriptions")
          .delete()
          .eq("endpoint", sub.endpoint);
      }
      if (result === "ok") sent += 1;
    }
  }

  return NextResponse.json({ ok: true, sent });
}

async function claimSlot(
  admin: NonNullable<ReturnType<typeof createServiceClient>>,
  userId: string,
  loggedOn: string,
  slot: GoalReminderSlot,
) {
  const { error } = await admin.from("goal_reminder_log").insert({
    user_id: userId,
    logged_on: loggedOn,
    slot,
  });
  if (!error) return true;
  if (error.code === "23505") return false;
  console.error("[cron/goal-reminders claim]", error.message);
  return false;
}
