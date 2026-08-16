"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FocusToggle } from "@/components/focus-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/i18n/language-switcher";
import { useI18n } from "@/i18n/provider";

export function AppNav({
  items,
}: {
  items: readonly { href: string; label: string }[];
}) {
  const pathname = usePathname();
  const { dictionary } = useI18n();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      if (wasOpen.current) buttonRef.current?.focus();
      wasOpen.current = false;
      return;
    }

    wasOpen.current = true;
    document.body.style.overflow = "hidden";
    const first = panelRef.current?.querySelector<HTMLElement>("a, button");
    first?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  function isActive(href: string) {
    if (href === "/discover") {
      return (
        pathname === "/discover" ||
        pathname.startsWith("/discover/") ||
        pathname.startsWith("/add")
      );
    }
    if (href === "/library") {
      return pathname === "/library" || pathname.startsWith("/vault");
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="app-nav-drawer"
        aria-label={open ? dictionary.nav.close : dictionary.nav.menu}
        onClick={() => setOpen((value) => !value)}
        className="flex size-9 items-center justify-center rounded-full text-muted transition hover:bg-foreground/6 hover:text-foreground"
      >
        <span aria-hidden className="flex h-3.5 w-4 flex-col justify-between">
          <span
            className={`h-px w-full origin-center bg-current transition duration-300 ${
              open ? "translate-y-[6.5px] rotate-45" : ""
            }`}
          />
          <span
            className={`h-px w-full bg-current transition duration-300 ${
              open ? "scale-x-0 opacity-0" : ""
            }`}
          />
          <span
            className={`h-px w-full origin-center bg-current transition duration-300 ${
              open ? "-translate-y-[6.5px] -rotate-45" : ""
            }`}
          />
        </span>
      </button>

      <div
        className={`fixed inset-x-0 top-14 bottom-0 z-50 ${open ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <button
          type="button"
          tabIndex={open ? 0 : -1}
          aria-label={dictionary.nav.close}
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-background/85 backdrop-blur-md transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <aside
          ref={panelRef}
          id="app-nav-drawer"
          inert={!open}
          className={`absolute inset-y-0 left-0 flex w-72 max-w-[min(18.5rem,88vw)] flex-col border-r border-border bg-surface shadow-[0_24px_80px_rgba(0,0,0,0.35)] transition-transform duration-300 ease-out ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <nav
            className="flex flex-1 flex-col gap-1 px-3 py-5"
            aria-label={dictionary.brand}
          >
            {items.map((item, index) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={`group flex items-baseline gap-3 rounded-xl px-3 py-3 transition ${
                    active
                      ? "bg-foreground/7 text-foreground"
                      : "text-muted hover:bg-foreground/4 hover:text-foreground"
                  }`}
                >
                  <span
                    className={`font-mono text-[0.62rem] tracking-[0.22em] ${
                      active ? "text-accent" : "text-muted/70"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-lg font-semibold tracking-[-0.03em]">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
          <div className="flex flex-col gap-3 border-t border-border px-5 py-4 md:hidden">
            <ThemeToggle />
            <FocusToggle />
            <LanguageSwitcher />
          </div>
        </aside>
      </div>
    </>
  );
}
