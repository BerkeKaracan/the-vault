import { Skeleton, skeletonKeys } from "@/components/skeleton";

export default function DeskLoading() {
  return (
    <main className="relative flex min-h-[calc(100dvh-3.75rem)] flex-1 flex-col">
      <div className="relative flex flex-1 items-end pt-8 pb-2 sm:pt-10">
        <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-end gap-8 px-6 sm:grid-cols-2 sm:px-8 lg:grid-cols-3">
          {skeletonKeys(3).map((key) => (
            <div key={key} className="flex flex-col items-center gap-3">
              <Skeleton className="h-2.5 w-14" />
              <Skeleton className="aspect-2/3 w-full max-w-56 rounded-sm" />
              <Skeleton className="h-3 w-40" />
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto w-full max-w-6xl px-6 pb-5 sm:px-8">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-2 h-28 w-full rounded-sm" />
      </div>
    </main>
  );
}
