import { loadEnvConfig } from "@next/env";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Database } from "@/lib/database.types";

loadEnvConfig(process.cwd());

function env(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required for RLS tests`);
  }
  return value;
}

const password = "test-pass-12";
const ids: string[] = [];

let admin: SupabaseClient<Database>;
let owner: SupabaseClient<Database>;
let stranger: SupabaseClient<Database>;
let ownerId: string;
let strangerId: string;
let materialId: string;

async function signedIn(email: string) {
  const client = createClient<Database>(
    env("NEXT_PUBLIC_SUPABASE_URL"),
    env("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return client;
}

describe("supabase rls", () => {
  beforeAll(async () => {
    admin = createClient<Database>(
      env("NEXT_PUBLIC_SUPABASE_URL"),
      env("SUPABASE_SERVICE_ROLE_KEY"),
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

    const stamp = Date.now();
    const ownerEmail = `vault-owner-${stamp}@example.com`;
    const strangerEmail = `vault-stranger-${stamp}@example.com`;

    const createdOwner = await admin.auth.admin.createUser({
      email: ownerEmail,
      password,
      email_confirm: true,
      user_metadata: { full_name: "Ada Lovelace" },
    });
    if (createdOwner.error || !createdOwner.data.user) {
      throw createdOwner.error ?? new Error("owner createUser failed");
    }
    ownerId = createdOwner.data.user.id;
    ids.push(ownerId);

    const createdStranger = await admin.auth.admin.createUser({
      email: strangerEmail,
      password,
      email_confirm: true,
    });
    if (createdStranger.error || !createdStranger.data.user) {
      throw createdStranger.error ?? new Error("stranger createUser failed");
    }
    strangerId = createdStranger.data.user.id;
    ids.push(strangerId);

    owner = await signedIn(ownerEmail);
    stranger = await signedIn(strangerEmail);

    const inserted = await owner
      .from("materials")
      .insert({
        title: "Owner desk book",
        source: "custom",
        status: "active",
        user_id: ownerId,
      })
      .select("id")
      .single();
    if (inserted.error || !inserted.data) {
      throw inserted.error ?? new Error("owner material insert failed");
    }
    materialId = inserted.data.id;
  });

  afterAll(async () => {
    for (const id of ids.reverse()) {
      await admin.auth.admin.deleteUser(id);
    }
  });

  it("creates a profile row from handle_new_user", async () => {
    const { data, error } = await owner
      .from("profiles")
      .select("id, display_name")
      .eq("id", ownerId)
      .maybeSingle();

    expect(error).toBeNull();
    expect(data?.id).toBe(ownerId);
    expect(data?.display_name).toBe("Ada Lovelace");
  });

  it("hides another user's materials on select", async () => {
    const { data } = await stranger
      .from("materials")
      .select("id")
      .eq("id", materialId);

    expect((data ?? []).map((row) => row.id)).not.toContain(materialId);
  });

  it("rejects updating another user's material", async () => {
    const { data } = await stranger
      .from("materials")
      .update({ title: "taken" })
      .eq("id", materialId)
      .select("id");

    expect(data ?? []).toEqual([]);
  });

  it("rejects inserting a material under another user_id", async () => {
    const { error } = await stranger.from("materials").insert({
      title: "planted",
      source: "custom",
      user_id: ownerId,
    });

    expect(error).toBeTruthy();
  });

  it("rejects log_progress on another user's material", async () => {
    const { error } = await stranger.rpc("log_progress", {
      p_material_id: materialId,
      p_page_after: 10,
      p_logged_on: "2026-08-17",
    });

    expect(error).toBeTruthy();
  });

  it("lets the owner read their own desk row", async () => {
    const { data, error } = await owner
      .from("materials")
      .select("id, title")
      .eq("id", materialId)
      .maybeSingle();

    expect(error).toBeNull();
    expect(data?.id).toBe(materialId);
  });
});
