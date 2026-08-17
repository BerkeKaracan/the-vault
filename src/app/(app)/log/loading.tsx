import {
  PageHeaderSkeleton,
  Skeleton,
  skeletonKeys,
} from "@/components/skeleton";

const CALENDAR_ROWS = 5;

export default function LogLoading() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-10 sm:px-8">
      <PageHeaderSkeleton />
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div>
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="mt-4 flex flex-col gap-1">
            {skeletonKeys(CALENDAR_ROWS).map((row) => (
              <div key={row} className="grid grid-cols-7 gap-1">
                {skeletonKeys(7).map((cell) => (
                  <Skeleton
                    key={`${row}-${cell}`}
                    className="aspect-square rounded-sm"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Skeleton className="h-3 w-28" />
          {skeletonKeys(3).map((key) => (
            <div key={key} className="flex flex-col gap-1.5">
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-2.5 w-20" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
