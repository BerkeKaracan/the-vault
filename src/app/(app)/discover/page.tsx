import type { Metadata } from "next";
import { Suspense } from "react";
import { AddMaterialPanel } from "@/components/materials/add-material-panel";
import { PageHeader } from "@/components/page-header";
import { CoverSkeletonGrid, Skeleton } from "@/components/skeleton";
import { getDictionary } from "@/i18n/get-dictionary";
import {
  type GoogleBooksPage,
  getBrowseCatalogPage,
} from "@/lib/catalog/google-books";

function DiscoverCatalogSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex gap-4 border-b border-border pb-3">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-10 max-w-md" />
      <CoverSkeletonGrid
        count={10}
        className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
      />
    </div>
  );
}

const EMPTY_CATALOG: GoogleBooksPage = {
  books: [],
  totalItems: 0,
  startIndex: 0,
  nextIndex: 0,
  hasMore: false,
};

const BROWSE_WAIT_MS = 2_500;

function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  fallback: T,
): Promise<T> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(fallback), ms);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch(() => {
        clearTimeout(timer);
        resolve(fallback);
      });
  });
}

async function DiscoverCatalog() {
  const initialPage = await withTimeout(
    getBrowseCatalogPage(),
    BROWSE_WAIT_MS,
    EMPTY_CATALOG,
  );
  return <AddMaterialPanel initialPage={initialPage} />;
}

export async function generateMetadata(): Promise<Metadata> {
  const dictionary = await getDictionary();
  return { title: `${dictionary.add.title} · ${dictionary.brand}` };
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
