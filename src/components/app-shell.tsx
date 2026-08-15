import Link from "next/link";
import { getSessionProfile } from "@/app/(app)/settings-actions";
import { AppNav } from "@/components/app-nav";
import { FocusToggle } from "@/components/focus-toggle";
import { PreferencesProvider } from "@/components/preferences";
import { UserMenu } from "@/components/user-menu";
import { getDictionary } from "@/i18n/get-dictionary";
import { LanguageSwitcher } from "@/i18n/language-switcher";
import { isAccentColor } from "@/lib/catalog";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const [dictionary, session] = await Promise.all([
    getDictionary(),
    getSessionProfile(),
  ]);
  const nav = [
    { href: "/desk", label: dictionary.nav.desk },
    { href: "/vault", label: dictionary.nav.vault },
    { href: "/add", label: dictionary.nav.add },
    { href: "/settings", label: dictionary.nav.settings },
  ] as const;

  const userLabel =
    session.profile?.display_name?.trim() ||
    session.email ||
    dictionary.nav.settings;

  const accent =
    session.profile?.accent_color && isAccentColor(session.profile.accent_color)
      ? session.profile.accent_color
      : "emerald";

  return (
    <PreferencesProvider
      accent={accent}
      dailyGoal={session.profile?.daily_goal ?? null}
      focusMode={session.profile?.focus_mode ?? false}
      className="flex min-h-dvh flex-1 flex-col bg-[#070708]"
    >
      <header className="sticky top-0 z-40 border-b border-white/6 bg-[#070708]/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-5 py-3.5 sm:px-8">
          <Link
            href="/desk"
            className="font-mono text-[0.7rem] tracking-[0.28em] text-zinc-400 uppercase transition hover:text-zinc-200"
          >
            {dictionary.brand}
          </Link>
          <div className="flex items-center gap-4">
            <AppNav items={nav} />
            <FocusToggle />
            <LanguageSwitcher />
            <UserMenu label={userLabel} />
          </div>
        </div>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </PreferencesProvider>
  );
}
