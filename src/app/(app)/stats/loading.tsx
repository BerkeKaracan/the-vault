import {
  PageHeaderSkeleton,
  Skeleton,
  skeletonKeys,
} from "@/components/skeleton";

export default function StatsLoading() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-10 sm:px-8">
      <PageHeaderSkeleton />
      <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-border bg-foreground/5 sm:grid-cols-2 lg:grid-cols-3">
        {skeletonKeys(6).map((key) => (
          <div key={key} className="bg-surface px-5 py-6">
            <Skeleton className="h-2.5 w-28" />
            <Skeleton className="mt-3 h-8 w-16" />
          </div>
        ))}
      </div>
    </main>
  );
}
