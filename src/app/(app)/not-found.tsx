import Link from "next/link";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function AppNotFound() {
  const dictionary = await getDictionary();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-16 sm:px-8">
      <p className="text-sm text-muted">{dictionary.errors.notFound}</p>
      <Link
        href="/add"
        className="mt-6 w-fit font-mono text-[0.65rem] tracking-[0.2em] text-muted uppercase hover:text-foreground/80"
      >
        {dictionary.book.backToAdd}
      </Link>
    </main>
  );
}
