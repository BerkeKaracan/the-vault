import { AddMaterialPanel } from "@/components/materials/add-material-panel";
import { getDictionary } from "@/i18n/get-dictionary";
import { BROWSE_ALL_QUERY, CATALOG_PAGE_SIZE } from "@/lib/book-shelves";
import {
  type GoogleBookResult,
  searchGoogleBooks,
} from "@/lib/google-books";

export default async function AddPage() {
  const dictionary = await getDictionary();
  let initialBooks: GoogleBookResult[] = [];
  try {
    initialBooks = await searchGoogleBooks(BROWSE_ALL_QUERY, CATALOG_PAGE_SIZE, {
      orderBy: "newest",
    });
  } catch {
    initialBooks = [];
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-10">
      <h1 className="font-display text-2xl font-semibold tracking-[-0.03em] text-foreground">
        {dictionary.add.title}
      </h1>
      <p className="mt-1.5 text-sm text-muted">{dictionary.add.subtitle}</p>
      <div className="mt-8">
        <AddMaterialPanel initialBooks={initialBooks} />
      </div>
    </main>
  );
}
