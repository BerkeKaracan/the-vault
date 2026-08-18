function heatClass(pages: number): string {
  if (pages <= 0) return "heat-0";
  if (pages < 10) return "heat-1";
  if (pages < 30) return "heat-2";
  if (pages < 60) return "heat-3";
  return "heat-4";
}

export function WeekChart({
  weeks,
  title,
  ariaLabel,
}: {
  weeks: { weekStart: string; pages: number }[];
  title: string;
  ariaLabel: string;
}) {
  const max = Math.max(1, ...weeks.map((week) => week.pages));
  const barWidth = 14;
  const gap = 6;
  const height = 88;
  const width = Math.max(1, weeks.length * (barWidth + gap) - gap);

  return (
    <section className="mt-10">
      <h2 className="font-mono text-[0.62rem] tracking-[0.18em] text-muted uppercase">
        {title}
      </h2>
      <svg
        role="img"
        aria-label={ariaLabel}
        viewBox={`0 0 ${width} ${height}`}
        className="mt-4 h-24 w-full max-w-xl"
      >
        {weeks.map((week, index) => {
          const barHeight = Math.max(
            2,
            (Math.max(0, week.pages) / max) * (height - 2),
          );
          return (
            <rect
              key={week.weekStart}
              x={index * (barWidth + gap)}
              y={height - barHeight}
              width={barWidth}
              height={barHeight}
              rx={2}
              className={heatClass(week.pages)}
            >
              <title>{`${week.weekStart}: ${week.pages}`}</title>
            </rect>
          );
        })}
      </svg>
    </section>
  );
}
