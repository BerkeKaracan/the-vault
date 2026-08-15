import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { Database } from "@/lib/database.types";
import { getSupabaseEnv, isSupabaseConfigured } from "@/lib/env";

function isPublicPath(path: string) {
  return (
    path === "/" ||
    path.startsWith("/login") ||
    path.startsWith("/auth") ||
    path.startsWith("/setup")
  );
}

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (!isSupabaseConfigured()) {
    if (path.startsWith("/setup") || path === "/") {
      return NextResponse.next({ request });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/setup";
    return NextResponse.redirect(url);
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const { url: supabaseUrl, anonKey } = getSupabaseEnv();

  const supabase = createServerClient<Database>(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        supabaseResponse = NextResponse.next({
          request,
        });
        for (const { name, value, options } of cookiesToSet) {
          supabaseResponse.cookies.set(name, value, options);
        }
        for (const [key, value] of Object.entries(headers)) {
          supabaseResponse.headers.set(key, value);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (path.startsWith("/setup")) {
    const url = request.nextUrl.clone();
    url.pathname = user ? "/desk" : "/";
    return NextResponse.redirect(url);
  }

  if (!user && !isPublicPath(path)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && (path.startsWith("/login") || path === "/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/desk";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
