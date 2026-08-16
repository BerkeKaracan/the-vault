import { DeskSurface } from "@/components/desk/desk-surface";
import { ContributionHeatmap } from "@/components/heatmap/contribution-heatmap";
import { getHeatmapData } from "@/lib/heatmap";
import { getActiveMaterials } from "@/lib/materials";
import { getSessionProfile } from "@/lib/profile";

export default async function DeskPage() {
  const [materials, session, heatmap] = await Promise.all([
    getActiveMaterials(),
    getSessionProfile(),
    getHeatmapData(),
  ]);

  return (
    <main className="relative flex min-h-[calc(100dvh-3.75rem)] flex-1 flex-col">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_0%,var(--accent-glow),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_100%,var(--desk-fade),transparent_70%)]" />
      </div>

      <DeskSurface materials={materials} />

      <div className="relative mx-auto w-full max-w-6xl px-6 pb-5 sm:px-8">
        <ContributionHeatmap
          weekStartsOn={session.profile?.week_starts_on ?? "monday"}
          dailyGoal={session.profile?.daily_goal ?? null}
          data={heatmap}
        />
      </div>
    </main>
  );
}
