import Link from "next/link";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function AppNotFound() {
  const dictionary = await getDictionary();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-16">
      <p className="text-sm text-zinc-500">{dictionary.errors.notFound}</p>
      <Link
        href="/add"
        className="mt-6 w-fit font-mono text-[0.65rem] tracking-[0.2em] text-zinc-400 uppercase hover:text-zinc-200"
      >
        {dictionary.book.backToAdd}
      </Link>
    </main>
  );
}
