"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import {
  consentCookieName,
  type CookieConsent,
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

  revalidatePath("/", "layout");
}
