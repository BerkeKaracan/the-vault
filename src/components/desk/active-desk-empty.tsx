"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/provider";

export function ActiveDeskEmpty() {
  const { dictionary } = useI18n();

  return (
    <div className="rounded-lg border border-dashed border-zinc-800 px-6 py-14 text-center">
      <p className="text-sm text-zinc-500">{dictionary.desk.empty}</p>
      <Link
        href="/add"
        className="mt-3 inline-block text-sm text-zinc-300 underline underline-offset-4 hover:text-white"
      >
        {dictionary.desk.addMaterial}
      </Link>
    </div>
  );
}
