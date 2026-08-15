import Link from "next/link";
import { signOut } from "@/app/(app)/actions";
import { AppNav } from "@/components/app-nav";
import { getDictionary } from "@/i18n/get-dictionary";
import { LanguageSwitcher } from "@/i18n/language-switcher";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const dictionary = await getDictionary();
  const nav = [
    { href: "/desk", label: dictionary.nav.desk },
    { href: "/vault", label: dictionary.nav.vault },
    { href: "/add", label: dictionary.nav.add },
  ] as const;

  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-[#08080a]">
      <header className="sticky top-0 z-40 border-b border-white/6 bg-[#08080a]/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <Link
            href="/desk"
            className="font-mono text-[0.7rem] tracking-[0.28em] text-zinc-400 uppercase transition hover:text-zinc-200"
          >
            {dictionary.brand}
          </Link>
          <div className="flex items-center gap-5">
            <AppNav items={nav} />
            <LanguageSwitcher />
            <form action={signOut}>
              <button
                type="submit"
                className="text-sm text-zinc-600 transition hover:text-zinc-300"
              >
                {dictionary.nav.signOut}
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-10">
        {children}
      </div>
    </div>
  );
}
