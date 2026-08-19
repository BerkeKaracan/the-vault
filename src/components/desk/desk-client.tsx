"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { DeskSurface } from "@/components/desk/desk-surface";
import { isMetricType } from "@/lib/catalog/fields";
import { getLocalDateString } from "@/lib/local-date";
import { applyProgressToHeatmap, type HeatmapPatch } from "@/lib/progress/day";
import type { Material, WeekStart } from "@/lib/types";

const ContributionHeatmap = dynamic(
  () =>
    import("@/components/heatmap/contribution-heatmap").then(
      (mod) => mod.ContributionHeatmap,
    ),
  { ssr: false, loading: () => <div className="min-h-40" /> },
);

export function DeskClient({
  materials: initialMaterials,
  heatmap: initialHeatmap,
  weekStartsOn,
  dailyGoal,
}: {
  materials: Material[];
  heatmap: HeatmapPatch;
  weekStartsOn: WeekStart;
  dailyGoal: number | null;
}) {
  const [serverMaterials, setServerMaterials] = useState(initialMaterials);
  const [materials, setMaterials] = useState(initialMaterials);
  const [serverHeatmap, setServerHeatmap] = useState(initialHeatmap);
  const [heatmap, setHeatmap] = useState(initialHeatmap);

  if (initialMaterials !== serverMaterials) {
    setServerMaterials(initialMaterials);
    setMaterials(initialMaterials);
  }
  if (initialHeatmap !== serverHeatmap) {
    setServerHeatmap(initialHeatmap);
    setHeatmap(initialHeatmap);
  }

  function onLogged(material: Material, delta: number) {
    setMaterials((current) =>
      current.map((item) => (item.id === material.id ? material : item)),
    );
    setHeatmap((current) =>
      applyProgressToHeatmap(current, getLocalDateString(), {
        materialId: material.id,
        title: material.title,
        metricType: isMetricType(material.metric_type)
          ? material.metric_type
          : "pages",
        delta,
      }),
    );
  }

  return (
    <>
      <DeskSurface materials={materials} onLogged={onLogged} />
      <div className="relative mx-auto w-full max-w-6xl px-6 pb-5 sm:px-8">
        <ContributionHeatmap
          weekStartsOn={weekStartsOn}
          dailyGoal={dailyGoal}
          data={heatmap}
        />
      </div>
    </>
  );
}
