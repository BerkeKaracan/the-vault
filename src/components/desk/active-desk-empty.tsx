"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/provider";

export function EmptyDeskSlot() {
  const { dictionary } = useI18n();

  return (
    <li>
      <Link
        href="/add"
        className="flex min-h-28 items-center gap-4 rounded-xl border border-dashed border-white/10 px-4 py-3 transition hover:border-white/20 hover:bg-white/[0.02]"
      >
        <div className="flex h-24 w-16 shrink-0 items-center justify-center rounded-sm border border-dashed border-white/10 sm:w-20">
          <span className="text-lg text-zinc-600">+</span>
        </div>
        <div>
          <p className="text-sm text-zinc-400">{dictionary.desk.emptySlot}</p>
          <p className="mt-1 text-sm text-zinc-600">
            {dictionary.desk.emptySlotCta}
          </p>
        </div>
      </Link>
    </li>
  );
}
