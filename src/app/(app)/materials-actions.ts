"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type {
  ActionErrorCode,
  ActionResult,
  Material,
  MaterialStatus,
} from "@/lib/types";

async function countActive(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("materials")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "active");

  if (error) throw error;
  return count ?? 0;
}

function mapActiveDeskError(message: string | undefined): ActionErrorCode {
  if (message?.includes("ACTIVE_DESK_FULL")) {
    return "deskFull";
  }
  return "generic";
}

export type AddMaterialInput = {
  title: string;
  author?: string | null;
  totalPages?: number | null;
  coverUrl?: string | null;
  googleBooksId?: string | null;
  source: "google" | "custom";
  status: Extract<MaterialStatus, "active" | "shelved">;
};

export async function addMaterial(
  input: AddMaterialInput,
): Promise<ActionResult<Material>> {
  const title = input.title.trim();
  if (!title) {
    return { ok: false, error: "titleRequired" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "authRequired" };
  }

  if (input.status === "active") {
    const activeCount = await countActive(user.id);
    if (activeCount >= 3) {
      return { ok: false, error: "deskFull" };
    }
  }

  const { data, error } = await supabase
    .from("materials")
    .insert({
      user_id: user.id,
      title,
      author: input.author?.trim() || null,
      total_pages: input.totalPages ?? null,
      cover_url: input.coverUrl ?? null,
      google_books_id: input.googleBooksId ?? null,
      source: input.source,
      status: input.status,
    })
    .select()
    .single();

  if (error) {
    return { ok: false, error: mapActiveDeskError(error.message) };
  }

  revalidatePath("/");
  revalidatePath("/vault");
  revalidatePath("/add");

  return { ok: true, data: data as Material };
}

export async function getActiveMaterials(): Promise<Material[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Material[];
}

export async function getVaultMaterials(): Promise<Material[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .eq("user_id", user.id)
    .in("status", ["shelved", "completed"])
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Material[];
}
