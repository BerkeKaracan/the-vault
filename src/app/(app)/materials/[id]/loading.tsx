import { Skeleton, skeletonKeys } from "@/components/skeleton";

export default function MaterialLoading() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-10 sm:px-8">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="mt-8 h-2.5 w-20" />
      <div className="mt-6 grid gap-8 sm:grid-cols-[14rem_minmax(0,1fr)]">
        <Skeleton className="aspect-2/3 w-full max-w-56 rounded-sm" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-3.5 w-40" />
          <div className="mt-2 flex flex-col gap-2">
            {skeletonKeys(4).map((key) => (
              <Skeleton key={key} className="h-3 w-full" />
            ))}
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="mt-2 h-10 w-56 rounded-full" />
        </div>
      </div>
    </main>
  );
}
