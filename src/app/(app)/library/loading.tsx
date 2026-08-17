import {
  CoverSkeletonGrid,
  PageHeaderSkeleton,
  Skeleton,
  skeletonKeys,
} from "@/components/skeleton";

export default function LibraryLoading() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-10 sm:px-8">
      <PageHeaderSkeleton />
      <div className="mt-8 grid gap-8 lg:grid-cols-[13rem_minmax(0,1fr)]">
        <aside className="flex flex-col gap-3">
          <Skeleton className="h-2.5 w-16" />
          {skeletonKeys(4).map((key) => (
            <Skeleton key={key} className="h-7 w-full rounded-full" />
          ))}
        </aside>
        <div className="flex flex-col gap-3">
          <Skeleton className="h-10 w-full" />
          <div className="flex gap-1.5">
            {skeletonKeys(4).map((key) => (
              <Skeleton key={key} className="h-6 w-20 rounded-full" />
            ))}
          </div>
          <CoverSkeletonGrid
            count={8}
            className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4"
          />
        </div>
      </div>
    </main>
  );
}
