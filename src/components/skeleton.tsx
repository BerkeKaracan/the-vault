const KEYS = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
] as const;

/** Stable keys for placeholder lists, so no array index ends up as a React key. */
export function skeletonKeys(count: number): readonly string[] {
  return KEYS.slice(0, Math.min(count, KEYS.length));
}

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-md bg-foreground/6 ${className}`}
    />
  );
}

export function CoverSkeletonGrid({
  count,
  className = "grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4",
}: {
  count: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {skeletonKeys(count).map((key) => (
        <div key={key} className="flex flex-col gap-3">
          <Skeleton className="aspect-2/3 rounded-sm" />
          <Skeleton className="h-3 w-4/5" />
          <Skeleton className="h-2.5 w-2/5" />
        </div>
      ))}
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-7 w-40" />
      <Skeleton className="h-3.5 w-64 max-w-full" />
    </div>
  );
}
