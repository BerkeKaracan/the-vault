export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return "https://the-value.vercel.app";
}

/** External Feedback Portal for The Vault (tenant the-value). */
export function getFeedbackPortalUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_FEEDBACK_PORTAL_URL?.trim();
  if (fromEnv) return fromEnv;
  return "https://feedback-portal-lyart.vercel.app/?tenant=the-value";
}
