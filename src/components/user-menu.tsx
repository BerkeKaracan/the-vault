"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut } from "@/app/(app)/actions";
import { useI18n } from "@/i18n/provider";

export function UserMenu({ label }: { label: string }) {
  const { dictionary } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="max-w-36 truncate text-sm text-muted transition hover:text-foreground"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {label}
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 min-w-40 rounded-lg border border-border bg-elevated py-1 shadow-xl"
        >
          <Link
            href="/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 text-sm text-foreground/80 hover:bg-foreground/5 hover:text-foreground"
          >
            {dictionary.nav.settings}
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              role="menuitem"
              className="block w-full px-3 py-2 text-left text-sm text-muted hover:bg-foreground/5 hover:text-foreground"
            >
              {dictionary.nav.signOut}
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
