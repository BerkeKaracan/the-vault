import { EmptyDeskSlot } from "@/components/desk/active-desk-empty";
import { MaterialCard } from "@/components/desk/material-card";
import type { Material } from "@/lib/types";

const DESK_LIMIT = 3;

export function ActiveDesk({ materials }: { materials: Material[] }) {
  const openSlots = Math.max(0, DESK_LIMIT - materials.length);

  return (
    <ul className="flex flex-col gap-3">
      {materials.map((material, index) => (
        <MaterialCard
          key={material.id}
          material={material}
          priority={index === 0}
        />
      ))}
      {Array.from({ length: openSlots }, (_, index) => (
        <EmptyDeskSlot key={`open-slot-${index}`} />
      ))}
    </ul>
  );
}
