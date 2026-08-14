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

function mapDbError(message: string | undefined): ActionErrorCode {
  if (!message) return "generic";
  if (message.includes("ACTIVE_DESK_FULL")) return "deskFull";
  if (message.includes("page_after must be greater")) return "invalidPage";
  if (message.includes("Material not found")) return "notFound";
  if (message.includes("Not authenticated")) return "authRequired";
  return "generic";
}

function revalidateMaterialPaths() {
  revalidatePath("/desk");
  revalidatePath("/vault");
  revalidatePath("/add");
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
    return { ok: false, error: mapDbError(error.message) };
  }

  revalidateMaterialPaths();
  return { ok: true, data: data as Material };
}

export async function logProgress(input: {
  materialId: string;
  pageAfter: number;
  loggedOn: string;
}): Promise<ActionResult<Material>> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.loggedOn)) {
    return { ok: false, error: "generic" };
  }
  if (!Number.isFinite(input.pageAfter) || input.pageAfter <= 0) {
    return { ok: false, error: "invalidPage" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "authRequired" };
  }

  const { data, error } = await supabase.rpc("log_progress", {
    p_material_id: input.materialId,
    p_page_after: Math.floor(input.pageAfter),
    p_logged_on: input.loggedOn,
  });

  if (error) {
    return { ok: false, error: mapDbError(error.message) };
  }

  revalidateMaterialPaths();
  return { ok: true, data: data as Material };
}

export async function markCompleted(
  materialId: string,
): Promise<ActionResult<Material>> {
  return updateMaterialStatus(materialId, "completed");
}

export async function shelveMaterial(
  materialId: string,
): Promise<ActionResult<Material>> {
  return updateMaterialStatus(materialId, "shelved");
}

export async function activateMaterial(
  materialId: string,
): Promise<ActionResult<Material>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "authRequired" };
  }

  const activeCount = await countActive(user.id);
  if (activeCount >= 3) {
    return { ok: false, error: "deskFull" };
  }

  const { data, error } = await supabase
    .from("materials")
    .update({ status: "active", updated_at: new Date().toISOString() })
    .eq("id", materialId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return { ok: false, error: mapDbError(error.message) };
  }

  revalidateMaterialPaths();
  return { ok: true, data: data as Material };
}

async function updateMaterialStatus(
  materialId: string,
  status: Extract<MaterialStatus, "shelved" | "completed">,
): Promise<ActionResult<Material>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "authRequired" };
  }

  const { data, error } = await supabase
    .from("materials")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", materialId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return { ok: false, error: mapDbError(error.message) };
  }
  if (!data) {
    return { ok: false, error: "notFound" };
  }

  revalidateMaterialPaths();
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

/** pages keyed by logged_on (YYYY-MM-DD local calendar day from client). */
export async function getHeatmapTotals(
  fromDate: string,
): Promise<Record<string, number>> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fromDate)) return {};

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return {};

  const { data, error } = await supabase
    .from("progress_entries")
    .select("logged_on, pages_delta")
    .eq("user_id", user.id)
    .gte("logged_on", fromDate);

  if (error) throw error;

  const totals: Record<string, number> = {};
  for (const row of data ?? []) {
    const day = row.logged_on as string;
    totals[day] = (totals[day] ?? 0) + (row.pages_delta as number);
  }
  return totals;
}
