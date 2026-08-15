"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/app/(app)/settings-actions";
import { AccentSwatches } from "@/components/materials/catalog-fields";
import type { CookieConsent } from "@/i18n/config";
import type { ErrorKey } from "@/i18n/dictionaries";
import { LanguageSwitcher } from "@/i18n/language-switcher";
import { useI18n } from "@/i18n/provider";
import { isAccentColor } from "@/lib/catalog";
import { setCookieConsent } from "@/lib/consent-actions";
import { TIMEZONES } from "@/lib/timezones";
import type { AccentColor, Profile, WeekStart } from "@/lib/types";

const fieldClass =
  "mt-1.5 w-full rounded-md border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-accent/50";

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
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [timezone, setTimezone] = useState(
    profile?.timezone ?? "Europe/Istanbul",
  );
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
          timezone,
          weekStartsOn,
          accentColor,
          dailyGoal: parsedGoal,
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
        <h2 className="font-display text-xl font-semibold tracking-[-0.03em] text-zinc-50">
          {dictionary.settings.profileTitle}
        </h2>
        <label className="mt-6 block text-sm text-zinc-400">
          {dictionary.settings.displayName}
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={80}
            className={fieldClass}
          />
        </label>
        <label className="mt-4 block text-sm text-zinc-400">
          {dictionary.settings.email}
          <input
            value={email ?? ""}
            readOnly
            className={`${fieldClass} text-zinc-500`}
          />
        </label>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold tracking-[-0.03em] text-zinc-50">
          {dictionary.settings.appearanceTitle}
        </h2>
        <div className="mt-6">
          <AccentSwatches value={accentColor} onChange={setAccentColor} />
        </div>
        <label className="mt-6 block text-sm text-zinc-400">
          {dictionary.settings.dailyGoal}
          <input
            type="number"
            min={1}
            value={dailyGoal}
            onChange={(e) => setDailyGoal(e.target.value)}
            className={fieldClass}
          />
          <span className="mt-1.5 block text-xs text-zinc-600">
            {dictionary.settings.dailyGoalHint}
          </span>
        </label>
        <p className="mt-6 text-sm text-zinc-400">
          {dictionary.settings.focusMode}
        </p>
        <p className="mt-1 text-xs text-zinc-600">
          {dictionary.settings.focusModeHint}
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold tracking-[-0.03em] text-zinc-50">
          {dictionary.settings.generalTitle}
        </h2>

        <div className="mt-6">
          <p className="text-sm text-zinc-400">{dictionary.language.label}</p>
          <div className="mt-2">
            <LanguageSwitcher />
          </div>
        </div>

        <label className="mt-4 block text-sm text-zinc-400">
          {dictionary.settings.timezone}
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className={fieldClass}
          >
            {TIMEZONES.map((zone) => (
              <option key={zone} value={zone}>
                {zone.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="mt-4">
          <legend className="text-sm text-zinc-400">
            {dictionary.settings.weekStart}
          </legend>
          <div className="mt-2 flex gap-4 text-sm text-zinc-300">
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
          <legend className="text-sm text-zinc-400">
            {dictionary.settings.cookiePref}
          </legend>
          <div className="mt-2 flex gap-4 text-sm text-zinc-300">
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
          <output className="text-sm text-zinc-500">{message}</output>
        ) : null}
      </div>
    </form>
  );
}
