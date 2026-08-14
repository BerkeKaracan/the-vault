import Link from "next/link";
import { signOut } from "@/app/(app)/actions";
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
    <div className="flex min-h-dvh flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-zinc-900 px-6 py-4">
        <Link
          href="/desk"
          className="font-mono text-xs tracking-[0.2em] text-zinc-400 uppercase hover:text-zinc-200"
        >
          {dictionary.brand}
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-zinc-500 transition hover:text-zinc-200"
            >
              {item.label}
            </Link>
          ))}
          <LanguageSwitcher />
          <form action={signOut}>
            <button
              type="submit"
              className="text-zinc-600 transition hover:text-zinc-300"
            >
              {dictionary.nav.signOut}
            </button>
          </form>
        </nav>
      </header>
      <div className="flex flex-1 flex-col px-6 py-8">{children}</div>
    </div>
  );
}
