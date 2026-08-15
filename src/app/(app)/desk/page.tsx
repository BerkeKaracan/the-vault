import { getSessionProfile } from "@/app/(app)/settings-actions";
import { DeskSurface } from "@/components/desk/desk-surface";
import { ContributionHeatmap } from "@/components/heatmap/contribution-heatmap";
import { getActiveMaterials } from "@/lib/materials";

export default async function DeskPage() {
  const [materials, session] = await Promise.all([
    getActiveMaterials(),
    getSessionProfile(),
  ]);

  return (
    <main className="relative flex min-h-[calc(100dvh-3.75rem)] flex-1 flex-col">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_0%,rgba(74,222,128,0.10),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_100%,rgba(0,0,0,0.55),transparent_70%)]" />
      </div>

      <DeskSurface materials={materials} />

      <div className="relative px-5 pb-5 sm:px-8">
        <ContributionHeatmap
          weekStartsOn={session.profile?.week_starts_on ?? "monday"}
        />
      </div>
    </main>
  );
}
