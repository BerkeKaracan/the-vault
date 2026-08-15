import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { Database } from "@/lib/database.types";
import { getSupabaseEnv, isSupabaseConfigured } from "@/lib/env";
import { safeNextPath } from "@/lib/paths";

function isPublicPath(path: string) {
  return (
    path === "/" ||
    path.startsWith("/login") ||
    path.startsWith("/auth") ||
    path.startsWith("/setup")
  );
}

function applyCookies(from: NextResponse, to: NextResponse) {
  for (const cookie of from.cookies.getAll()) {
    to.cookies.set(cookie);
  }
  return to;
}

function redirectWithCookies(
  request: NextRequest,
  sessionResponse: NextResponse,
  pathname: string,
  search?: Record<string, string>,
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  if (search) {
    for (const [key, value] of Object.entries(search)) {
      url.searchParams.set(key, value);
    }
  }
  return applyCookies(sessionResponse, NextResponse.redirect(url));
}

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (!isSupabaseConfigured()) {
    if (path.startsWith("/setup") || path === "/") {
      return NextResponse.next({ request });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/setup";
    url.search = "";
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
    return redirectWithCookies(request, supabaseResponse, user ? "/desk" : "/");
  }

  if (!user && !isPublicPath(path)) {
    if (path.startsWith("/api/")) {
      return applyCookies(
        supabaseResponse,
        NextResponse.json({ error: "authRequired" }, { status: 401 }),
      );
    }
    return redirectWithCookies(request, supabaseResponse, "/login", {
      next: safeNextPath(`${path}${request.nextUrl.search}`),
    });
  }

  if (user && path.startsWith("/login")) {
    const next = safeNextPath(request.nextUrl.searchParams.get("next"));
    return redirectWithCookies(request, supabaseResponse, next);
  }

  if (user && path === "/") {
    return redirectWithCookies(request, supabaseResponse, "/desk");
  }

  return supabaseResponse;
}
