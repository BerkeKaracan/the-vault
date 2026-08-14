"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { isLocale, type Locale, localeCookieName } from "./config";

export async function setLocale(locale: Locale) {
  if (!isLocale(locale)) return;

  const cookieStore = await cookies();
  cookieStore.set(localeCookieName, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  revalidatePath("/", "layout");
}
