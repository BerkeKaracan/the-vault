import Image from "next/image";

type CoverProps = {
  title: string;
  author?: string | null;
  coverUrl?: string | null;
  className?: string;
  priority?: boolean;
};

export function Cover({
  title,
  author,
  coverUrl,
  className = "",
  priority = false,
}: CoverProps) {
  return (
    <div
      className={`relative aspect-[2/3] overflow-hidden rounded-sm bg-zinc-900 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.8)] ring-1 ring-white/5 ${className}`}
    >
      {coverUrl ? (
        <Image
          src={coverUrl}
          alt={title}
          fill
          sizes="160px"
          className="object-cover"
          priority={priority}
          unoptimized
        />
      ) : (
        <div className="flex h-full w-full flex-col justify-between bg-[radial-gradient(ellipse_at_top,_#27272a_0%,_#09090b_70%)] p-4">
          <p className="line-clamp-4 text-[0.95rem] leading-snug font-medium tracking-tight text-zinc-100">
            {title}
          </p>
          {author ? (
            <p className="truncate font-mono text-[0.65rem] tracking-wide text-zinc-500 uppercase">
              {author}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
