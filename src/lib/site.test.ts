import { afterEach, describe, expect, it, vi } from "vitest";
import { getFeedbackPortalUrl, getSiteUrl } from "@/lib/site";

describe("getSiteUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("strips a trailing slash from the public site URL", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://the-vault.example/");
    expect(getSiteUrl()).toBe("https://the-vault.example");
  });

  it("falls back to production when the public site URL is empty", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    expect(getSiteUrl()).toBe("https://the-value.vercel.app");
  });
});

describe("getFeedbackPortalUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses the env override when set", () => {
    vi.stubEnv(
      "NEXT_PUBLIC_FEEDBACK_PORTAL_URL",
      "https://example.com/portal?tenant=x",
    );
    expect(getFeedbackPortalUrl()).toBe("https://example.com/portal?tenant=x");
  });

  it("defaults to the the-value tenant portal", () => {
    vi.stubEnv("NEXT_PUBLIC_FEEDBACK_PORTAL_URL", "");
    expect(getFeedbackPortalUrl()).toBe(
      "https://feedback-portal-lyart.vercel.app/?tenant=the-value",
    );
  });
});
