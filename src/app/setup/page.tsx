import { getDictionary } from "@/i18n/get-dictionary";
import { LanguageSwitcher } from "@/i18n/language-switcher";

export default async function SetupPage() {
  const dictionary = await getDictionary();

  return (
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-1 flex-col justify-center px-6 py-16">
      <div className="absolute top-6 right-6">
        <LanguageSwitcher />
      </div>
      <p className="font-mono text-xs tracking-[0.2em] text-zinc-500 uppercase">
        {dictionary.brand}
      </p>
      <h1 className="mt-3 text-2xl font-medium tracking-tight text-zinc-100">
        {dictionary.setup.title}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-zinc-500">
        {dictionary.setup.body}
      </p>

      <ol className="mt-8 list-decimal space-y-3 pl-5 text-sm text-zinc-400">
        <li>{dictionary.setup.step1}</li>
        <li>{dictionary.setup.step2}</li>
        <li>{dictionary.setup.step3}</li>
        <li>{dictionary.setup.step4}</li>
      </ol>

      <pre className="mt-8 overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs leading-relaxed text-zinc-400">
        {`NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
GOOGLE_BOOKS_API_KEY=`}
      </pre>
    </main>
  );
}
