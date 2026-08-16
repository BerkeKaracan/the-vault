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
      className={`relative aspect-2/3 overflow-hidden rounded-sm bg-elevated shadow-[0_12px_40px_-18px_color-mix(in_srgb,var(--foreground)_28%,transparent)] ring-1 ring-border ${className}`}
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
        <div className="flex h-full w-full flex-col justify-between bg-linear-to-br from-elevated via-surface to-background p-3">
          <span className="absolute inset-y-0 left-0 w-[3px] bg-foreground/20" />
          <p
            className="line-clamp-4 text-[0.8rem] leading-snug font-medium tracking-tight text-foreground"
            data-private
          >
            {title}
          </p>
          {author ? (
            <p
              className="truncate font-mono text-[0.6rem] tracking-wide text-muted uppercase"
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
