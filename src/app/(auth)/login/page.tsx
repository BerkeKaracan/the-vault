import { getDictionary } from "@/i18n/get-dictionary";
import { LanguageSwitcher } from "@/i18n/language-switcher";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const dictionary = await getDictionary();

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="absolute top-6 right-6">
        <LanguageSwitcher />
      </div>
      <div className="mb-10 text-center">
        <p className="font-mono text-xs tracking-[0.2em] text-zinc-500 uppercase">
          {dictionary.brand}
        </p>
        <h1 className="mt-3 text-2xl font-medium tracking-tight text-zinc-100">
          {dictionary.login.title}
        </h1>
        <p className="mt-2 max-w-xs text-sm text-zinc-500">
          {dictionary.login.subtitle}
        </p>
      </div>
      <LoginForm />
    </main>
  );
}
