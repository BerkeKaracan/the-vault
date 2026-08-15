import Image from "next/image";

type CoverProps = {
  title: string;
  author?: string | null;
  coverUrl?: string | null;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

export function Cover({
  title,
  author,
  coverUrl,
  className = "",
  priority = false,
  sizes = "160px",
}: CoverProps) {
  return (
    <div
      className={`relative aspect-[2/3] overflow-hidden rounded-sm bg-zinc-200 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.35)] ring-1 ring-border dark:bg-zinc-900 dark:shadow-[0_12px_40px_-16px_rgba(0,0,0,0.8)] ${className}`}
    >
      {coverUrl ? (
        <Image
          src={coverUrl}
          alt={title}
          fill
          sizes={sizes}
          className="object-cover"
          priority={priority}
          unoptimized
        />
      ) : (
        <div className="flex h-full w-full flex-col justify-between bg-gradient-to-br from-zinc-200 via-zinc-100 to-white p-3 dark:from-zinc-800 dark:via-zinc-900 dark:to-zinc-950">
          <span className="absolute inset-y-0 left-0 w-[3px] bg-black/20 dark:bg-black/40" />
          <p
            className="line-clamp-4 text-[0.8rem] leading-snug font-medium tracking-tight text-zinc-900 dark:text-zinc-100"
            data-private
          >
            {title}
          </p>
          {author ? (
            <p
              className="truncate font-mono text-[0.6rem] tracking-wide text-zinc-600 uppercase dark:text-zinc-500"
              data-private
            >
              {author}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
