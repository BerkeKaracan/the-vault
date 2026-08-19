import { afterEach, describe, expect, it, vi } from "vitest";
import { getSiteUrl } from "@/lib/site";

describe("getSiteUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("strips a trailing slash from the public site URL", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://the-vault.example/");
    expect(getSiteUrl()).toBe("https://the-vault.example");
  });

  it("falls back to production when unset", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    expect(getSiteUrl()).toBe("https://the-value.vercel.app");
  });
});
