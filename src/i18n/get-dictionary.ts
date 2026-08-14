import { cookies, headers } from "next/headers";
import {
  defaultLocale,
  isLocale,
  type Locale,
  localeCookieName,
} from "./config";
import { type Dictionary, dictionaries } from "./dictionaries";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(localeCookieName)?.value;
  if (isLocale(fromCookie)) return fromCookie;

  const headerStore = await headers();
  const accept = headerStore.get("accept-language")?.toLowerCase() ?? "";
  if (accept.includes("tr")) return "tr";
  if (accept.includes("en")) return "en";
  return defaultLocale;
}

export async function getDictionary(): Promise<Dictionary> {
  const locale = await getLocale();
  return dictionaries[locale];
}
