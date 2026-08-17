"use client";

import { useState, useTransition } from "react";
import { setGoalReminders, updateProfile } from "@/app/(app)/settings/actions";
import { AccentSwatches } from "@/components/materials/catalog-fields";
import type { CookieConsent } from "@/i18n/config";
import type { ErrorKey } from "@/i18n/dictionaries";
import { LanguageSwitcher } from "@/i18n/language-switcher";
import { useI18n } from "@/i18n/provider";
import { isAccentColor } from "@/lib/catalog/fields";
import { setCookieConsent } from "@/lib/consent-actions";
import {
  notificationsSupported,
  registerGoalWorker,
  showGoalNotification,
  subscribeGoalPush,
  unsubscribeGoalPush,
} from "@/lib/push-client";
import type { AccentColor, Profile, WeekStart } from "@/lib/types";
import { usePreferences } from "@/store";

const fieldClass =
  "mt-1.5 w-full rounded-md border border-border bg-elevated px-3 py-2 text-sm text-foreground outline-none focus:border-accent/50";

export function SettingsForm({
  email,
  profile,
  consent,
}: {
  email: string | null;
  profile: Profile | null;
  consent: CookieConsent | null;
}) {
  const { dictionary } = useI18n();
  const { colorScheme, setTheme, focusMode, toggleFocus } = usePreferences();
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [weekStartsOn, setWeekStartsOn] = useState<WeekStart>(
    profile?.week_starts_on ?? "monday",
  );
  const [accentColor, setAccentColor] = useState<AccentColor>(
    profile?.accent_color && isAccentColor(profile.accent_color)
      ? profile.accent_color
      : "emerald",
  );
  const [dailyGoal, setDailyGoal] = useState(
    profile?.daily_goal != null ? String(profile.daily_goal) : "",
  );
  const [cookiePref, setCookiePref] = useState<CookieConsent>(
    consent ?? "necessary",
  );
  const [goalReminders, setGoalRemindersOn] = useState(
    profile?.goal_reminders ?? false,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const parsedGoal = dailyGoal.trim() === "" ? null : Number(dailyGoal);

    startTransition(async () => {
      const [profileResult] = await Promise.all([
        updateProfile({
          displayName,
          weekStartsOn,
          accentColor,
          dailyGoal: parsedGoal,
          colorScheme,
        }),
        setCookieConsent(cookiePref),
      ]);

      if (!profileResult.ok) {
        const code = profileResult.error;
        setMessage(
          code in dictionary.errors
            ? dictionary.errors[code as ErrorKey]
            : dictionary.errors.generic,
        );
        return;
      }

      setMessage(dictionary.settings.saved);
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-lg flex-col gap-12">
      <section>
        <h2 className="font-display text-xl font-semibold tracking-[-0.03em] text-foreground">
          {dictionary.settings.profileTitle}
        </h2>
        <label className="mt-6 block text-sm text-muted">
          {dictionary.settings.displayName}
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={80}
            className={fieldClass}
          />
        </label>
        <label className="mt-4 block text-sm text-muted">
          {dictionary.settings.email}
          <input
            value={email ?? ""}
            readOnly
            className={`${fieldClass} text-muted`}
          />
        </label>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold tracking-[-0.03em] text-foreground">
          {dictionary.settings.appearanceTitle}
        </h2>
        <fieldset className="mt-6">
          <legend className="text-sm text-muted">
            {dictionary.settings.theme}
          </legend>
          <div className="mt-2 flex gap-4 text-sm text-foreground/80">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="color-scheme"
                checked={colorScheme === "dark"}
                onChange={() => setTheme("dark")}
              />
              {dictionary.settings.themeDark}
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="color-scheme"
                checked={colorScheme === "light"}
                onChange={() => setTheme("light")}
              />
              {dictionary.settings.themeLight}
            </label>
          </div>
        </fieldset>
        <div className="mt-6">
          <AccentSwatches value={accentColor} onChange={setAccentColor} />
        </div>
        <label className="mt-6 block text-sm text-muted">
          {dictionary.settings.dailyGoal}
          <input
            type="number"
            min={1}
            value={dailyGoal}
            onChange={(e) => setDailyGoal(e.target.value)}
            className={fieldClass}
          />
          <span className="mt-1.5 block text-xs text-muted">
            {dictionary.settings.dailyGoalHint}
          </span>
        </label>
        <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">
          <label className="flex items-center gap-2 text-sm text-foreground/80">
            <input
              type="checkbox"
              checked={goalReminders}
              disabled={pending}
              onChange={(event) => {
                const next = event.target.checked;
                setMessage(null);
                startTransition(async () => {
                  if (next) {
                    if (!notificationsSupported()) {
                      setMessage(dictionary.reminders.unsupported);
                      return;
                    }
                    const permission = await Notification.requestPermission();
                    if (permission !== "granted") {
                      setMessage(dictionary.reminders.denied);
                      return;
                    }
                    await subscribeGoalPush();
                  } else {
                    await unsubscribeGoalPush();
                  }
                  const result = await setGoalReminders(next);
                  if (!result.ok) {
                    setMessage(dictionary.errors.generic);
                    return;
                  }
                  setGoalRemindersOn(next);
                });
              }}
            />
            {dictionary.reminders.label}
          </label>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              setMessage(null);
              startTransition(async () => {
                if (!notificationsSupported()) {
                  setMessage(dictionary.reminders.unsupported);
                  return;
                }
                const permission =
                  Notification.permission === "granted"
                    ? "granted"
                    : await Notification.requestPermission();
                if (permission !== "granted") {
                  setMessage(dictionary.reminders.denied);
                  return;
                }
                await registerGoalWorker();
                await showGoalNotification({
                  title: dictionary.reminders.testTitle,
                  body: dictionary.reminders.testBody,
                  tag: "vault-goal-test",
                  actionTitle: dictionary.reminders.actionDesk,
                });
              });
            }}
            className="rounded-full border border-border px-3 py-1.5 text-xs text-foreground/80 transition hover:border-foreground/25 hover:text-foreground disabled:opacity-40"
          >
            {dictionary.reminders.test}
          </button>
        </div>
        <p className="mt-1 text-xs text-muted">{dictionary.reminders.hint}</p>
        <label className="mt-6 flex items-center gap-2 text-sm text-foreground/80">
          <input
            type="checkbox"
            checked={focusMode}
            onChange={() => toggleFocus()}
          />
          {dictionary.settings.focusMode}
        </label>
        <p className="mt-1 text-xs text-muted">
          {dictionary.settings.focusModeHint}
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold tracking-[-0.03em] text-foreground">
          {dictionary.settings.generalTitle}
        </h2>

        <div className="mt-6">
          <p className="text-sm text-muted">{dictionary.language.label}</p>
          <div className="mt-2">
            <LanguageSwitcher />
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm text-muted">
            {dictionary.settings.weekStart}
          </legend>
          <div className="mt-2 flex gap-4 text-sm text-foreground/80">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="week-start"
                checked={weekStartsOn === "monday"}
                onChange={() => setWeekStartsOn("monday")}
              />
              {dictionary.settings.weekMonday}
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="week-start"
                checked={weekStartsOn === "sunday"}
                onChange={() => setWeekStartsOn("sunday")}
              />
              {dictionary.settings.weekSunday}
            </label>
          </div>
        </fieldset>

        <fieldset className="mt-4">
          <legend className="text-sm text-muted">
            {dictionary.settings.cookiePref}
          </legend>
          <div className="mt-2 flex gap-4 text-sm text-foreground/80">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="cookie-pref"
                checked={cookiePref === "necessary"}
                onChange={() => setCookiePref("necessary")}
              />
              {dictionary.settings.cookieNecessary}
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="cookie-pref"
                checked={cookiePref === "all"}
                onChange={() => setCookiePref("all")}
              />
              {dictionary.settings.cookieAll}
            </label>
          </div>
        </fieldset>
      </section>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-fg transition hover:opacity-90 disabled:opacity-40"
        >
          {dictionary.settings.save}
        </button>
        {message ? (
          <output className="text-sm text-muted">{message}</output>
        ) : null}
      </div>
    </form>
  );
}
