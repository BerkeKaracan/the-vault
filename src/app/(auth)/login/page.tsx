import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { getDictionary } from "@/i18n/get-dictionary";
import { LanguageSwitcher } from "@/i18n/language-switcher";
import { safeNextPath } from "@/lib/paths";
import { LoginForm } from "./login-form";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const dictionary = await getDictionary();
  const params = await searchParams;
  const nextValue = params.next;
  const next = safeNextPath(
    Array.isArray(nextValue) ? nextValue[0] : nextValue,
  );
  const errorValue = params.error;
  const error = Array.isArray(errorValue) ? errorValue[0] : errorValue;

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
      <LoginForm
        next={next}
        error={error ?? null}
        showDevLogin={process.env.NODE_ENV === "development"}
      />
    </main>
  );
}
