import { cookies } from "next/headers";
import {
  type CookieConsent,
  consentCookieName,
  isCookieConsent,
} from "@/i18n/config";

export async function getCookieConsent(): Promise<CookieConsent | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(consentCookieName)?.value;
  return isCookieConsent(value) ? value : null;
}
