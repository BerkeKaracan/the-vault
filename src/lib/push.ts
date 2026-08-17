import webpush from "web-push";
import { isLocale, type Locale } from "@/i18n/config";
import { dictionaries } from "@/i18n/dictionaries";
import { t } from "@/i18n/t";
import type { GoalReminderSlot } from "@/lib/goal-reminders";

export function getVapidPublicKey(): string | null {
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  return key && key.length > 0 ? key : null;
}

function vapidConfig() {
  const publicKey = getVapidPublicKey();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
  const subject = process.env.VAPID_SUBJECT?.trim() || "mailto:hello@localhost";
  if (!publicKey || !privateKey) return null;
  return { publicKey, privateKey, subject };
}

export function reminderCopy(
  locale: string,
  slot: GoalReminderSlot,
  goal: number,
  today: number,
): { title: string; body: string; actionTitle: string } {
  const dict = dictionaries[isLocale(locale) ? locale : "tr"];
  if (slot === "12h") {
    return {
      title: dict.reminders.noonTitle,
      body: t(dict.reminders.noonBody, { goal, today }),
      actionTitle: dict.reminders.actionDesk,
    };
  }
  return {
    title: dict.reminders.eveningTitle,
    body: t(dict.reminders.eveningBody, {
      left: Math.max(0, goal - today),
    }),
    actionTitle: dict.reminders.actionDesk,
  };
}

export async function sendPush(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: {
    title: string;
    body: string;
    url?: string;
    tag?: string;
    actionTitle?: string;
  },
): Promise<"ok" | "gone" | "error"> {
  const vapid = vapidConfig();
  if (!vapid) return "error";

  webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      },
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        url: payload.url ?? "/desk",
        tag: payload.tag,
        actionTitle: payload.actionTitle,
      }),
    );
    return "ok";
  } catch (error) {
    const status =
      error && typeof error === "object" && "statusCode" in error
        ? Number(error.statusCode)
        : 0;
    if (status === 404 || status === 410) return "gone";
    console.error("[push]", error);
    return "error";
  }
}

export type { Locale };
