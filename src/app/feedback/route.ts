import { NextResponse } from "next/server";
import { getFeedbackPortalUrl } from "@/lib/site";

/** Public hop to the Feedback Portal — keeps the external URL in one place. */
export function GET() {
  return NextResponse.redirect(getFeedbackPortalUrl(), 302);
}
