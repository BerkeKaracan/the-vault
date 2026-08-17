"use client";

import { useEffect } from "react";
import { useI18n } from "@/i18n/provider";
import { t } from "@/i18n/t";
import {
  GOAL_REMINDER_HOURS,
  type GoalReminderSlot,
} from "@/lib/goal-reminders";
import { getLocalDateString } from "@/lib/local-date";
import {
  registerGoalWorker,
  showGoalNotification,
  subscribeGoalPush,
} from "@/lib/push-client";

function storageKey(slot: GoalReminderSlot, date: string) {
  return `vault-goal-${slot}-${date}`;
}

export function GoalReminders({
  enabled,
  dailyGoal,
}: {
  enabled: boolean;
  dailyGoal: number | null;
}) {
  const { dictionary } = useI18n();

  useEffect(() => {
    if (!enabled || dailyGoal == null || dailyGoal <= 0) return;
    const goal = dailyGoal;
    if (typeof Notification === "undefined") return;
    if (Notification.permission !== "granted") return;

    let cancelled = false;
    const timers: number[] = [];

    async function todayPages() {
      const date = getLocalDateString();
      const res = await fetch(`/api/progress/today?d=${date}`);
      if (!res.ok) return { pages: 0, date };
      const data = (await res.json()) as { pages?: number };
      return { pages: data.pages ?? 0, date };
    }

    async function fire(slot: GoalReminderSlot) {
      const { pages, date } = await todayPages();
      if (cancelled || pages >= goal) return;
      const key = storageKey(slot, date);
      if (localStorage.getItem(key)) return;
      const copy =
        slot === "12h"
          ? {
              title: dictionary.reminders.noonTitle,
              body: t(dictionary.reminders.noonBody, {
                goal,
                today: pages,
              }),
            }
          : {
              title: dictionary.reminders.eveningTitle,
              body: t(dictionary.reminders.eveningBody, {
                left: Math.max(0, goal - pages),
              }),
            };
      await showGoalNotification({
        title: copy.title,
        body: copy.body,
        tag: `vault-goal-${slot}-${date}`,
        actionTitle: dictionary.reminders.actionDesk,
      });
      localStorage.setItem(key, "1");
    }

    function arm(slot: GoalReminderSlot) {
      const hour = GOAL_REMINDER_HOURS[slot];
      const now = new Date();
      const target = new Date();
      target.setHours(hour, 0, 0, 0);
      if (now >= target) {
        const laterHour = GOAL_REMINDER_HOURS["3h"];
        if (slot === "12h" && now.getHours() >= laterHour) return;
        void fire(slot);
        return;
      }
      timers.push(
        window.setTimeout(() => {
          void fire(slot);
        }, target.getTime() - now.getTime()),
      );
    }

    void registerGoalWorker()
      .then(() => subscribeGoalPush())
      .catch(() => undefined);

    arm("12h");
    arm("3h");

    return () => {
      cancelled = true;
      for (const timer of timers) window.clearTimeout(timer);
    };
  }, [enabled, dailyGoal, dictionary]);

  return null;
}
