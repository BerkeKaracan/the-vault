"use client";

import { useState, useTransition } from "react";
import { activateMaterial } from "@/app/(app)/materials-actions";
import { Cover } from "@/components/materials/cover";
import type { ErrorKey } from "@/i18n/dictionaries";
import { useI18n } from "@/i18n/provider";
import type { Material } from "@/lib/types";

function translateError(
  dictionary: ReturnType<typeof useI18n>["dictionary"],
  code: string,
) {
  if (code in dictionary.errors) {
    return dictionary.errors[code as ErrorKey];
  }
  return dictionary.errors.generic;
}

export function VaultGrid({ materials }: { materials: Material[] }) {
  const { dictionary } = useI18n();
  const [message, setMessage] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (materials.length === 0) {
    return (
      <div className="mt-8 rounded-lg border border-dashed border-zinc-800 px-6 py-16 text-center text-sm text-zinc-600">
        {dictionary.vault.empty}
      </div>
    );
  }

  return (
    <div className="mt-8">
      {message ? (
        <output className="mb-4 block text-sm text-zinc-500">{message}</output>
      ) : null}
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {materials.map((material) => (
          <li key={material.id} className="group relative">
            <Cover
              title={material.title}
              author={material.author}
              coverUrl={material.cover_url}
            />
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 opacity-0 transition group-hover:pointer-events-auto group-hover:opacity-100">
              <p className="line-clamp-2 text-sm font-medium text-zinc-100">
                {material.title}
              </p>
              <p className="mt-1 font-mono text-[0.65rem] tracking-wide text-zinc-400 uppercase">
                {material.status === "completed"
                  ? dictionary.vault.statusCompleted
                  : dictionary.vault.statusShelved}
              </p>
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  setMessage(null);
                  setPendingId(material.id);
                  startTransition(async () => {
                    const result = await activateMaterial(material.id);
                    setPendingId(null);
                    if (!result.ok) {
                      setMessage(translateError(dictionary, result.error));
                    }
                  });
                }}
                className="mt-2 rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-950 disabled:opacity-40"
              >
                {pending && pendingId === material.id
                  ? "…"
                  : dictionary.vault.activate}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
