import { AddMaterialPanel } from "@/components/materials/add-material-panel";
import { PageHeader } from "@/components/page-header";
import { getDictionary } from "@/i18n/get-dictionary";
import { BROWSE_ALL_QUERY, CATALOG_PAGE_SIZE } from "@/lib/book-shelves";
import { type GoogleBooksPage, searchGoogleBooks } from "@/lib/google-books";

export default async function DiscoverPage() {
  const dictionary = await getDictionary();
  let initialPage: GoogleBooksPage = {
    books: [],
    totalItems: 0,
    startIndex: 0,
    nextIndex: 0,
    hasMore: false,
  };
  try {
    initialPage = await searchGoogleBooks(BROWSE_ALL_QUERY, CATALOG_PAGE_SIZE, {
      orderBy: "newest",
    });
  } catch {
    initialPage = {
      books: [],
      totalItems: 0,
      startIndex: 0,
      nextIndex: 0,
      hasMore: false,
    };
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-10 sm:px-8">
      <PageHeader
        title={dictionary.add.title}
        subtitle={dictionary.add.subtitle}
      />
      <div className="mt-8">
        <AddMaterialPanel initialPage={initialPage} />
      </div>
    </main>
  );
}
