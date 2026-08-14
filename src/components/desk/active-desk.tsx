import { ActiveDeskEmpty } from "@/components/desk/active-desk-empty";
import { MaterialCard } from "@/components/desk/material-card";
import type { Material } from "@/lib/types";

export function ActiveDesk({ materials }: { materials: Material[] }) {
  if (materials.length === 0) {
    return <ActiveDeskEmpty />;
  }

  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {materials.map((material, index) => (
        <MaterialCard
          key={material.id}
          material={material}
          priority={index === 0}
        />
      ))}
    </ul>
  );
}
