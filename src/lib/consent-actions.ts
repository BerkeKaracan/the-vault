"use server";

import { refresh } from "next/cache";
import { cookies } from "next/headers";
import {
  type CookieConsent,
  consentCookieName,
  isCookieConsent,
} from "@/i18n/config";

export async function setCookieConsent(value: CookieConsent) {
  if (!isCookieConsent(value)) return;

  const cookieStore = await cookies();
  cookieStore.set(consentCookieName, value, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  refresh();
}
