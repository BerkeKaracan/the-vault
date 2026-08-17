import { AppNav } from "@/components/app-nav";
import { FocusToggle } from "@/components/focus-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { getDictionary } from "@/i18n/get-dictionary";
import { LanguageSwitcher } from "@/i18n/language-switcher";
import { getCookieConsent } from "@/lib/consent";
import { getSessionProfile } from "@/lib/profile";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const [dictionary, session, consent] = await Promise.all([
    getDictionary(),
    getSessionProfile(),
    getCookieConsent(),
  ]);
  const nav = [
    { href: "/desk", label: dictionary.nav.desk },
    { href: "/library", label: dictionary.nav.library },
    { href: "/discover", label: dictionary.nav.discover },
    { href: "/log", label: dictionary.nav.log },
    { href: "/stats", label: dictionary.nav.stats },
  ] as const;

  const userLabel =
    session.profile?.display_name?.trim() ||
    session.email ||
    dictionary.nav.settings;

  return (
    <div
      className={`flex min-h-dvh flex-1 flex-col bg-surface ${consent ? "" : "pb-44 sm:pb-32"}`}
    >
      <header className="sticky top-0 z-40 h-14 border-b border-border bg-surface/80 backdrop-blur-xl">
        <div className="flex h-full items-center gap-2 px-4 sm:px-8">
          <AppNav items={nav} />
          <div className="ml-auto flex items-center gap-2 sm:gap-4">
            <div className="hidden items-center gap-4 md:flex">
              <ThemeToggle />
              <FocusToggle />
              <LanguageSwitcher />
            </div>
            <UserMenu label={userLabel} />
          </div>
        </div>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
