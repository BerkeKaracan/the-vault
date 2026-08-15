import { cookies } from "next/headers";
import {
  type ColorScheme,
  colorSchemeCookieName,
  defaultColorScheme,
  isColorScheme,
} from "@/lib/theme";

export async function getColorScheme(): Promise<ColorScheme> {
  const cookieStore = await cookies();
  const value = cookieStore.get(colorSchemeCookieName)?.value;
  return isColorScheme(value) ? value : defaultColorScheme;
}
