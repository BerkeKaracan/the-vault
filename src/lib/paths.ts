const FALLBACK = "/desk";

export function safeNextPath(value: string | null | undefined): string {
  if (!value) return FALLBACK;
  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return FALLBACK;
  }
  if (
    value.startsWith("/login") ||
    value.startsWith("/auth") ||
    value.startsWith("/setup")
  ) {
    return FALLBACK;
  }
  return value;
}
