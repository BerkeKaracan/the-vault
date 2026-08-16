"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FocusToggle } from "@/components/focus-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/i18n/language-switcher";
import { useI18n } from "@/i18n/provider";

function navLinkClass(active: boolean) {
  return active
    ? "rounded-full bg-foreground/8 px-3 py-1.5 text-foreground"
    : "rounded-full px-3 py-1.5 text-muted transition hover:text-foreground";
}

export function AppNav({
  items,
}: {
  items: readonly { href: string; label: string }[];
}) {
  const pathname = usePathname();
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

  function isActive(href: string) {
    return (
      pathname === href ||
      pathname.startsWith(`${href}/`) ||
      (href === "/add" && pathname.startsWith("/discover"))
    );
  }

  return (
    <div ref={rootRef} className="relative flex items-center">
      <nav className="hidden items-center gap-1 text-sm md:flex">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={navLinkClass(active)}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="ml-4 hidden items-center gap-4 md:flex">
        <ThemeToggle />
        <FocusToggle />
        <LanguageSwitcher />
      </div>

      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls="app-nav-menu"
        onClick={() => setOpen((value) => !value)}
        className="rounded-full px-3 py-1.5 font-mono text-[0.65rem] tracking-[0.18em] text-muted uppercase transition hover:text-foreground md:hidden"
      >
        {dictionary.nav.menu}
      </button>
      {open ? (
        <div
          id="app-nav-menu"
          role="menu"
          className="absolute top-full right-0 z-50 mt-2 flex min-w-48 flex-col gap-1 rounded-lg border border-border bg-elevated p-2 shadow-xl md:hidden"
        >
          <nav className="flex flex-col gap-1 text-sm">
            {items.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={navLinkClass(active)}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-1 flex flex-col items-start gap-2 border-t border-border pt-2">
            <ThemeToggle />
            <FocusToggle />
            <LanguageSwitcher />
          </div>
        </div>
      ) : null}
    </div>
  );
}
