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

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const initial = label.trim().charAt(0).toLocaleUpperCase() || "?";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`flex items-center gap-2 rounded-full border py-1 pr-2 pl-1 transition ${
          open
            ? "border-foreground/25 bg-foreground/8 text-foreground"
            : "border-transparent text-muted hover:border-border hover:bg-foreground/5 hover:text-foreground"
        }`}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span
          aria-hidden="true"
          className="flex size-7 items-center justify-center rounded-full bg-accent/15 font-mono text-[0.7rem] font-medium text-accent"
        >
          {initial}
        </span>
        <span
          data-private
          className="hidden max-w-32 truncate text-sm sm:block"
        >
          {label}
        </span>
        <svg
          aria-hidden="true"
          viewBox="0 0 12 12"
          className={`size-2.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M2 4.5 6 8.5 10 4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 min-w-48 overflow-hidden rounded-xl border border-border bg-elevated py-1 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.6)]"
        >
          <p
            data-private
            className="truncate border-b border-border px-3 pt-2 pb-2.5 font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase"
          >
            {label}
          </p>
          <Link
            href="/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="mt-1 block px-3 py-2 text-sm text-foreground/80 transition hover:bg-foreground/5 hover:text-foreground"
          >
            {dictionary.nav.settings}
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              role="menuitem"
              className="block w-full px-3 py-2 text-left text-sm text-muted transition hover:bg-foreground/5 hover:text-foreground"
            >
              {dictionary.nav.signOut}
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
