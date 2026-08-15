import type { Dictionary } from "@/i18n/dictionaries";

type Kind = "book" | "set" | "docs";

const COVER_TONES: Record<Kind, string> = {
  book: "from-stone-800/70 via-zinc-900 to-zinc-950",
  set: "from-emerald-900/55 via-zinc-900 to-zinc-950",
  docs: "from-sky-950/80 via-zinc-900 to-zinc-950",
};

const HEAT_LEVELS = [
  "bg-white/[0.04]",
  "bg-emerald-500/20",
  "bg-emerald-500/40",
  "bg-emerald-400/65",
  "bg-emerald-300/90",
] as const;

/** Stable pseudo-random level so server and client render identical markup. */
function heatLevel(index: number, total: number) {
  const hash = (index * 2654435761) % 1000;
  const weekend = index % 7 >= 5;
  const recency = index / total;
  const empty = (weekend ? 620 : 420) - recency * 160;

  if (hash < empty) return 0;
  if (hash < empty + 300) return 1;
  if (hash < empty + 460) return 2;
  if (hash < empty + 550) return 3;
  return 4;
}

function heatCells(weeks: number) {
  const total = weeks * 7;
  return Array.from({ length: total }, (_, index) => ({
    id: `heat-${index}`,
    level: heatLevel(index, total),
    today: index === total - 1,
  }));
}

const HEAT_COMPACT = heatCells(26);
const HEAT_FULL = heatCells(52);

function CoverPlate({
  title,
  kindLabel,
  kind,
  variant = "full",
  className = "",
}: {
  title: string;
  kindLabel: string;
  kind: Kind;
  variant?: "full" | "mark";
  className?: string;
}) {
  return (
    <div
      className={`relative flex overflow-hidden rounded-[3px] border border-white/10 bg-gradient-to-br ${COVER_TONES[kind]} ${className}`}
    >
      <span className="absolute inset-y-0 left-0 w-[3px] bg-black/50" />
      <span className="absolute inset-x-0 top-0 h-px bg-white/10" />
      {variant === "mark" ? (
        <span className="font-mono m-auto text-[0.55rem] tracking-[0.18em] text-white/40 uppercase">
          {kindLabel.slice(0, 3)}
        </span>
      ) : (
        <div className="mt-auto flex w-full flex-col gap-1 p-2.5">
          <span className="font-mono text-[0.48rem] tracking-[0.22em] text-white/35 uppercase">
            {kindLabel}
          </span>
          <span className="font-display text-[0.72rem] leading-snug font-semibold text-white/80">
            {title}
          </span>
        </div>
      )}
    </div>
  );
}

function DeskRow({
  title,
  meta,
  kindLabel,
  kind,
  progress,
  pages,
}: {
  title: string;
  meta: string;
  kindLabel: string;
  kind: Kind;
  progress: number;
  pages: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/6 bg-white/2 p-2.5">
      <CoverPlate
        title={title}
        kindLabel={kindLabel}
        kind={kind}
        variant="mark"
        className="h-14 w-10 shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.78rem] font-medium text-zinc-200">
          {title}
        </p>
        <p className="truncate text-[0.68rem] text-zinc-500">{meta}</p>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/7">
            <div
              className="h-full rounded-full bg-emerald-400/90"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="font-mono text-[0.6rem] text-zinc-500">{pages}</span>
        </div>
      </div>
    </div>
  );
}

function LockedSlot({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-dashed border-white/10 p-2.5">
      <div className="flex h-14 w-10 shrink-0 items-center justify-center rounded-[3px] border border-dashed border-white/10">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="size-4 text-zinc-600"
        >
          <rect x="4" y="10.5" width="16" height="10" rx="2" />
          <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
        </svg>
      </div>
      <div className="flex-1 space-y-2">
        <div className="h-2 w-28 rounded-full bg-white/6" />
        <div className="h-2 w-16 rounded-full bg-white/[0.035]" />
      </div>
      <span className="font-mono text-[0.55rem] tracking-[0.2em] text-zinc-600 uppercase">
        {label}
      </span>
    </div>
  );
}

function PanelChrome({
  label,
  sample,
  trailing,
}: {
  label: string;
  sample: string;
  trailing: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/6 pb-3">
      <div className="flex items-center gap-2">
        <span className="font-mono text-[0.6rem] tracking-[0.25em] text-zinc-500 uppercase">
          {label}
        </span>
        <span className="rounded-full border border-white/8 px-1.5 py-0.5 font-mono text-[0.5rem] tracking-[0.16em] text-zinc-600 uppercase">
          {sample}
        </span>
      </div>
      <span className="font-mono text-[0.6rem] text-zinc-600">{trailing}</span>
    </div>
  );
}

export function DeskPanel({
  dictionary,
  variant = "hero",
}: {
  dictionary: Dictionary;
  variant?: "hero" | "limit";
}) {
  const { landing } = dictionary;

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-4 shadow-[0_50px_120px_-50px_rgba(0,0,0,0.95)] backdrop-blur-xl">
      <PanelChrome
        label={landing.deskMockLabel}
        sample={landing.mockSample}
        trailing="3 / 3"
      />
      <div className="mt-3 space-y-2">
        <DeskRow
          title={landing.mockBookTitle}
          meta={landing.mockBookMeta}
          kindLabel={landing.kindBook}
          kind="book"
          progress={62}
          pages="418 / 671"
        />
        <DeskRow
          title={landing.mockSetTitle}
          meta={landing.mockSetMeta}
          kindLabel={landing.kindSet}
          kind="set"
          progress={35}
          pages="84 / 240"
        />
        <DeskRow
          title={landing.mockDocsTitle}
          meta={landing.mockDocsMeta}
          kindLabel={landing.kindDocs}
          kind="docs"
          progress={12}
          pages="96 / 780"
        />
        {variant === "limit" ? <LockedSlot label={landing.mockLimit} /> : null}
      </div>
      {variant === "hero" ? (
        <div className="mt-4 border-t border-white/6 pt-3">
          <div className="flex items-center justify-between pb-2">
            <span className="font-mono text-[0.6rem] tracking-[0.25em] text-zinc-500 uppercase">
              {landing.heatMockLabel}
            </span>
            <span className="font-mono text-[0.6rem] text-emerald-400/80">
              +1
            </span>
          </div>
          <HeatGrid compact />
        </div>
      ) : null}
    </div>
  );
}

export function HeatGrid({ compact = false }: { compact?: boolean }) {
  const cells = compact ? HEAT_COMPACT : HEAT_FULL;

  return (
    <div
      className={`grid grid-flow-col grid-rows-7 ${compact ? "gap-[2px]" : "gap-[3px]"}`}
    >
      {cells.map((cell) => (
        <span
          key={cell.id}
          className={`aspect-square rounded-[2px] ${HEAT_LEVELS[cell.level]} ${cell.today ? "ring-1 ring-emerald-300/80" : ""}`}
        />
      ))}
    </div>
  );
}

export function HeatPanel({ dictionary }: { dictionary: Dictionary }) {
  const { landing } = dictionary;

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 backdrop-blur-xl">
      <PanelChrome
        label={landing.heatMockLabelYear}
        sample={landing.mockSample}
        trailing=""
      />
      <div className="mt-4">
        <HeatGrid />
      </div>
      <div className="mt-4 flex items-center gap-1">
        {HEAT_LEVELS.map((level) => (
          <span key={level} className={`size-2 rounded-[2px] ${level}`} />
        ))}
      </div>
    </div>
  );
}

export function VaultPanel({ dictionary }: { dictionary: Dictionary }) {
  const { landing } = dictionary;
  const covers: { title: string; kind: Kind }[] = [
    { title: landing.mockCoverA, kind: "book" },
    { title: landing.mockCoverB, kind: "docs" },
    { title: landing.mockCoverC, kind: "book" },
    { title: landing.mockCoverD, kind: "docs" },
    { title: landing.mockCoverE, kind: "set" },
    { title: landing.mockCoverF, kind: "docs" },
  ];

  const kindLabel = (kind: Kind) =>
    kind === "book"
      ? landing.kindBook
      : kind === "set"
        ? landing.kindSet
        : landing.kindDocs;

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 backdrop-blur-xl">
      <PanelChrome
        label={landing.vaultMockLabel}
        sample={landing.mockSample}
        trailing={String(covers.length)}
      />
      <div className="mt-4 grid grid-cols-3 gap-3">
        {covers.map((cover) => (
          <CoverPlate
            key={`${cover.kind}-${cover.title}`}
            title={cover.title}
            kindLabel={kindLabel(cover.kind)}
            kind={cover.kind}
            className="aspect-[2/3] transition duration-500 hover:-translate-y-1 hover:border-white/25"
          />
        ))}
      </div>
    </div>
  );
}
