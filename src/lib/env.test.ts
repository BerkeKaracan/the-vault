import { afterEach, describe, expect, it, vi } from "vitest";

describe("supabase env", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("is configured only when both public values exist", async () => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon");
    const { isSupabaseConfigured, getSupabaseEnv } = await import("@/lib/env");
    expect(isSupabaseConfigured()).toBe(true);
    expect(getSupabaseEnv()).toEqual({
      url: "https://example.supabase.co",
      anonKey: "anon",
    });
  });

  it("throws when a key is missing", async () => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    const { isSupabaseConfigured, getSupabaseEnv } = await import("@/lib/env");
    expect(isSupabaseConfigured()).toBe(false);
    expect(() => getSupabaseEnv()).toThrow(/Supabase env/);
  });
});
