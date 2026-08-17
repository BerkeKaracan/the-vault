import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();
  return <AppShell>{children}</AppShell>;
}
