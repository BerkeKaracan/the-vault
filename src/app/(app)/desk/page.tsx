import type { Metadata } from "next";
import { DeskClient } from "@/components/desk/desk-client";
import { getDictionary } from "@/i18n/get-dictionary";
import { getActiveMaterials } from "@/lib/library/materials";
import { getSessionProfile } from "@/lib/profile";
import { getHeatmapData } from "@/lib/progress/heatmap";

export async function generateMetadata(): Promise<Metadata> {
  const dictionary = await getDictionary();
  return { title: `${dictionary.nav.desk} · ${dictionary.brand}` };
}

export default async function DeskPage() {
  const [materials, session, heatmap] = await Promise.all([
    getActiveMaterials(),
    getSessionProfile(),
    getHeatmapData(),
  ]);

  return (
    <main className="relative flex min-h-[calc(100dvh-3.75rem)] flex-1 flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="desk-orb absolute top-[-20%] left-[20%] size-[55vh] rounded-full bg-[radial-gradient(ellipse_70%_45%_at_50%_0%,var(--accent-glow),transparent_60%)] blur-2xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_100%,var(--desk-fade),transparent_70%)]" />
      </div>

      <DeskClient
        materials={materials}
        heatmap={heatmap}
        weekStartsOn={session.profile?.week_starts_on ?? "monday"}
        dailyGoal={session.profile?.daily_goal ?? null}
      />
    </main>
  );
}
