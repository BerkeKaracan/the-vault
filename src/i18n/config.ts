export const locales = ["tr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "tr";
export const localeCookieName = "vault_locale";
export const consentCookieName = "vault_cookie_consent";
export const consentValues = ["necessary", "all"] as const;
export type CookieConsent = (typeof consentValues)[number];

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "tr" || value === "en";
}

export function isCookieConsent(
  value: string | undefined | null,
): value is CookieConsent {
  return value === "necessary" || value === "all";
}
