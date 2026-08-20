import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

/** Next.js 16 network boundary (formerly middleware.ts). */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|feedback-portal-verify\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
