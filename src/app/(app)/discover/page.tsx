import { Suspense } from "react";
import { AddMaterialPanel } from "@/components/materials/add-material-panel";
import { PageHeader } from "@/components/page-header";
import { getDictionary } from "@/i18n/get-dictionary";
import {
  type GoogleBooksPage,
  getBrowseCatalogPage,
} from "@/lib/catalog/google-books";

function DiscoverCatalogSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex gap-4 border-b border-border">
        <div className="mb-3 h-5 w-20 animate-pulse rounded bg-foreground/6" />
        <div className="mb-3 h-5 w-16 animate-pulse rounded bg-foreground/6" />
      </div>
      <div className="h-10 max-w-md animate-pulse rounded-md bg-foreground/6" />
      <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {(["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"] as const).map(
          (key) => (
            <li
              key={key}
              className="aspect-2/3 animate-pulse rounded-sm bg-foreground/6"
            />
          ),
        )}
      </ul>
    </div>
  );
}

async function DiscoverCatalog() {
  let initialPage: GoogleBooksPage = {
    books: [],
    totalItems: 0,
    startIndex: 0,
    nextIndex: 0,
    hasMore: false,
  };
  try {
    initialPage = await getBrowseCatalogPage();
  } catch {
    /* empty vitrine; client search still works */
  }
  return <AddMaterialPanel initialPage={initialPage} />;
}

export default async function DiscoverPage() {
  const dictionary = await getDictionary();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-10 sm:px-8">
      <PageHeader
        title={dictionary.add.title}
        subtitle={dictionary.add.subtitle}
      />
      <div className="mt-8">
        <Suspense fallback={<DiscoverCatalogSkeleton />}>
          <DiscoverCatalog />
        </Suspense>
      </div>
    </main>
  );
}
