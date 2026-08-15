export const colorSchemes = ["dark", "light"] as const;
export type ColorScheme = (typeof colorSchemes)[number];
export const colorSchemeCookieName = "vault_color_scheme";
export const defaultColorScheme: ColorScheme = "dark";

export function isColorScheme(
  value: string | null | undefined,
): value is ColorScheme {
  return value === "dark" || value === "light";
}
