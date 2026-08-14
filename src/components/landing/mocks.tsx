import type { Dictionary } from "@/i18n/dictionaries";

const COVER_TONES = [
  "from-emerald-800/50 via-zinc-900 to-zinc-950",
  "from-amber-800/45 via-zinc-900 to-zinc-950",
  "from-sky-900/50 via-zinc-900 to-zinc-950",
  "from-rose-900/40 via-zinc-900 to-zinc-950",
  "from-violet-900/45 via-zinc-900 to-zinc-950",
  "from-teal-900/45 via-zinc-900 to-zinc-950",
] as const;

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
  }));
}

const HEAT_COMPACT = heatCells(26);
const HEAT_FULL = heatCells(52);

function CoverPlate({
  title,
  tone,
  variant = "full",
  className = "",
}: {
  title: string;
  tone: number;
  variant?: "full" | "mark";
  className?: string;
}) {
  return (
    <div
      className={`relative flex overflow-hidden rounded-[3px] border border-white/10 bg-gradient-to-br ${COVER_TONES[tone % COVER_TONES.length]} ${className}`}
    >
      <span className="absolute inset-y-0 left-0 w-[3px] bg-black/45" />
      <span className="absolute inset-x-0 top-0 h-px bg-white/10" />
      {variant === "mark" ? (
        <span className="font-display m-auto text-base leading-none font-semibold text-white/45">
          {title.trim().charAt(0).toUpperCase()}
        </span>
      ) : (
        <span className="font-display mt-auto p-2.5 text-[0.7rem] leading-snug font-semibold text-white/75">
          {title}
        </span>
      )}
    </div>
  );
}

function DeskRow({
  title,
  author,
  tone,
  progress,
  pages,
}: {
  title: string;
  author: string;
  tone: number;
  progress: number;
  pages: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
      <CoverPlate
        title={title}
        tone={tone}
        variant="mark"
        className="h-14 w-10 shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.78rem] font-medium text-zinc-200">
          {title}
        </p>
        <p className="truncate text-[0.68rem] text-zinc-500">{author}</p>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/[0.07]">
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

function LockedSlot() {
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
        <div className="h-2 w-28 rounded-full bg-white/[0.06]" />
        <div className="h-2 w-16 rounded-full bg-white/[0.035]" />
      </div>
      <span className="font-mono text-[0.55rem] tracking-[0.2em] text-zinc-600 uppercase">
        Limit
      </span>
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
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
        <span className="font-mono text-[0.6rem] tracking-[0.25em] text-zinc-500 uppercase">
          {landing.deskMockLabel}
        </span>
        <span className="font-mono text-[0.6rem] text-zinc-600">3 / 3</span>
      </div>
      <div className="mt-3 space-y-2">
        <DeskRow
          title={landing.mockTitle1}
          author={landing.mockAuthor1}
          tone={0}
          progress={62}
          pages="418 / 671"
        />
        <DeskRow
          title={landing.mockTitle2}
          author={landing.mockAuthor2}
          tone={1}
          progress={35}
          pages="84 / 240"
        />
        <DeskRow
          title={landing.mockTitle3}
          author={landing.mockAuthor3}
          tone={2}
          progress={12}
          pages="96 / 780"
        />
        {variant === "limit" ? <LockedSlot /> : null}
      </div>
      {variant === "hero" ? (
        <div className="mt-4 border-t border-white/[0.06] pt-3">
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
          className={`aspect-square rounded-[2px] ${HEAT_LEVELS[cell.level]}`}
        />
      ))}
    </div>
  );
}

export function HeatPanel({ dictionary }: { dictionary: Dictionary }) {
  const { landing } = dictionary;

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between pb-4">
        <span className="font-mono text-[0.6rem] tracking-[0.25em] text-zinc-500 uppercase">
          {landing.heatMockLabelYear}
        </span>
        <div className="flex items-center gap-1">
          {HEAT_LEVELS.map((level) => (
            <span key={level} className={`size-2 rounded-[2px] ${level}`} />
          ))}
        </div>
      </div>
      <HeatGrid />
    </div>
  );
}

export function VaultPanel({ dictionary }: { dictionary: Dictionary }) {
  const { landing } = dictionary;
  const covers = [
    landing.mockTitle1,
    landing.mockTitle4,
    landing.mockTitle2,
    landing.mockTitle5,
    landing.mockTitle3,
    landing.mockTitle6,
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between pb-4">
        <span className="font-mono text-[0.6rem] tracking-[0.25em] text-zinc-500 uppercase">
          {landing.vaultMockLabel}
        </span>
        <span className="font-mono text-[0.6rem] text-zinc-600">
          {covers.length}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {covers.map((title, index) => (
          <CoverPlate
            key={title}
            title={title}
            tone={index}
            className="aspect-[2/3] transition duration-500 hover:-translate-y-1 hover:border-white/25"
          />
        ))}
      </div>
    </div>
  );
}
