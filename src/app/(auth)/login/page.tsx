import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { getDictionary } from "@/i18n/get-dictionary";
import { LanguageSwitcher } from "@/i18n/language-switcher";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const dictionary = await getDictionary();

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="absolute top-6 right-6 flex items-center gap-3">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>
      <div className="mb-10 text-center">
        <Link
          href="/"
          className="font-mono text-xs tracking-[0.2em] text-muted uppercase hover:text-foreground/80"
        >
          {dictionary.brand}
        </Link>
        <h1 className="mt-3 text-2xl font-medium tracking-tight text-foreground">
          {dictionary.login.title}
        </h1>
        <p className="mt-2 max-w-xs text-sm text-muted">
          {dictionary.login.subtitle}
        </p>
      </div>
      <LoginForm />
    </main>
  );
}
