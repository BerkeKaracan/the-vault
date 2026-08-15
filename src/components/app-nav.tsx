"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AppNav({
  items,
}: {
  items: readonly { href: string; label: string }[];
}) {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-5 text-sm">
      {items.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "text-zinc-100"
                : "text-zinc-500 transition hover:text-zinc-200"
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
