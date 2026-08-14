export const locales = ["tr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "tr";
export const localeCookieName = "vault_locale";

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "tr" || value === "en";
}
