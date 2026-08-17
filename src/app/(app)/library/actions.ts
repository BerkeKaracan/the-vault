"use server";

import { refresh } from "next/cache";
import { getAuthUser } from "@/lib/auth";
import { isUuid } from "@/lib/ids";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/types";

function cleanName(raw: string): string | null {
  const name = raw.trim().slice(0, 48);
  return name.length > 0 ? name : null;
}

export async function createCollection(
  rawName: string,
): Promise<ActionResult<{ id: string }>> {
  const name = cleanName(rawName);
  if (!name) return { ok: false, error: "titleRequired" };

  const [supabase, user] = await Promise.all([createClient(), getAuthUser()]);
  if (!user) return { ok: false, error: "authRequired" };

  const { data, error } = await supabase
    .from("collections")
    .insert({ user_id: user.id, name })
    .select("id")
    .single();

  if (error || !data) return { ok: false, error: "generic" };
  refresh();
  return { ok: true, data: { id: data.id } };
}

export async function deleteCollection(
  collectionId: string,
): Promise<ActionResult> {
  if (!isUuid(collectionId)) return { ok: false, error: "notFound" };

  const [supabase, user] = await Promise.all([createClient(), getAuthUser()]);
  if (!user) return { ok: false, error: "authRequired" };

  const { error } = await supabase
    .from("collections")
    .delete()
    .eq("id", collectionId)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: "generic" };
  refresh();
  return { ok: true, data: undefined };
}

export async function setCollectionMembership(
  collectionId: string,
  materialId: string,
  on: boolean,
): Promise<ActionResult> {
  if (!isUuid(collectionId) || !isUuid(materialId)) {
    return { ok: false, error: "notFound" };
  }

  const [supabase, user] = await Promise.all([createClient(), getAuthUser()]);
  if (!user) return { ok: false, error: "authRequired" };

  if (on) {
    const { error } = await supabase.from("collection_items").insert({
      collection_id: collectionId,
      material_id: materialId,
      user_id: user.id,
    });
    if (error && !error.message.includes("duplicate")) {
      return { ok: false, error: "generic" };
    }
  } else {
    const { error } = await supabase
      .from("collection_items")
      .delete()
      .eq("collection_id", collectionId)
      .eq("material_id", materialId)
      .eq("user_id", user.id);
    if (error) return { ok: false, error: "generic" };
  }

  refresh();
  return { ok: true, data: undefined };
}
