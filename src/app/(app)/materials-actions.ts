"use server";

import { refresh, revalidatePath } from "next/cache";
import { isMetricType, parseTags } from "@/lib/catalog";
import {
  type GoogleBookResult,
  getGoogleBook,
  isGoogleVolumeId,
} from "@/lib/google-books";
import { findMaterialByGoogleId } from "@/lib/materials";
import { createClient } from "@/lib/supabase/server";
import type {
  ActionErrorCode,
  ActionResult,
  Material,
  MaterialNote,
  MaterialStatus,
  MetricType,
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
  if (
    message.includes("page_after must be greater") ||
    message.includes("page_after must be >=")
  ) {
    return "invalidPage";
  }
  if (message.includes("Material not found")) return "notFound";
  if (message.includes("Not authenticated")) return "authRequired";
  if (
    message.includes("duplicate key") ||
    message.includes("materials_user_google_books_id")
  ) {
    return "alreadyOwned";
  }
  return "generic";
}

function revalidateMaterialPaths(
  materialId?: string,
  googleId?: string | null,
) {
  revalidatePath("/desk");
  revalidatePath("/vault");
  revalidatePath("/add");
  revalidatePath("/materials", "layout");
  revalidatePath("/discover", "layout");
  if (materialId) {
    revalidatePath(`/materials/${materialId}`);
  }
  if (googleId) {
    revalidatePath(`/discover/${googleId}`);
  }
}

function categoriesOrNull(
  categories: string[] | null | undefined,
): string[] | null {
  if (!categories || categories.length === 0) return null;
  const cleaned = categories.map((item) => item.trim()).filter(Boolean);
  return cleaned.length > 0 ? cleaned : null;
}

export type AddMaterialInput = {
  title: string;
  author?: string | null;
  totalPages?: number | null;
  coverUrl?: string | null;
  googleBooksId?: string | null;
  source: "google" | "custom";
  status: Extract<MaterialStatus, "active" | "shelved">;
  description?: string | null;
  publishedDate?: string | null;
  publisher?: string | null;
  categories?: string[] | null;
  metricType?: MetricType;
  tags?: string[] | string;
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

  const description = input.description?.trim() ?? "";
  const rawMetric = input.metricType ?? "pages";
  const metricType: MetricType = isMetricType(rawMetric) ? rawMetric : "pages";
  const tags =
    typeof input.tags === "string" ? parseTags(input.tags) : (input.tags ?? []);

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
      description: description.length > 0 ? description : null,
      published_date: input.publishedDate?.trim() || null,
      publisher: input.publisher?.trim() || null,
      categories: categoriesOrNull(input.categories),
      metric_type: metricType,
      tags,
    })
    .select()
    .single();

  if (error) {
    return { ok: false, error: mapDbError(error.message) };
  }
  if (!data) {
    return { ok: false, error: "generic" };
  }

  revalidateMaterialPaths(data.id, data.google_books_id);
  return { ok: true, data };
}

export async function addGoogleBook(
  googleId: string,
  status: Extract<MaterialStatus, "active" | "shelved">,
  extras?: { metricType?: MetricType; tags?: string[] | string },
): Promise<ActionResult<Material>> {
  if (!isGoogleVolumeId(googleId)) {
    return { ok: false, error: "notFound" };
  }

  const existing = await findMaterialByGoogleId(googleId);
  if (existing) {
    return { ok: false, error: "alreadyOwned" };
  }

  let book: GoogleBookResult | null;
  try {
    book = await getGoogleBook(googleId);
  } catch {
    return { ok: false, error: "generic" };
  }

  if (!book) {
    return { ok: false, error: "notFound" };
  }

  return addMaterial({
    title: book.title,
    author: book.authors.join(", ") || null,
    totalPages: book.pageCount,
    coverUrl: book.coverUrl,
    googleBooksId: book.id,
    source: "google",
    status,
    description: book.description,
    publishedDate: book.publishedDate,
    publisher: book.publisher,
    categories: book.categories,
    metricType: extras?.metricType ?? "pages",
    tags: extras?.tags,
  });
}

export async function logProgress(input: {
  materialId: string;
  pageAfter: number;
  loggedOn: string;
  durationSeconds?: number;
  unitsDelta?: number;
}): Promise<ActionResult<Material>> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.loggedOn)) {
    return { ok: false, error: "generic" };
  }
  if (!Number.isFinite(input.pageAfter) || input.pageAfter < 0) {
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
  if (!data) {
    return { ok: false, error: "generic" };
  }

  const duration = input.durationSeconds;
  const unitsDelta = input.unitsDelta ?? 0;
  if (duration && Number.isFinite(duration) && duration > 0 && unitsDelta > 0) {
    const ended = new Date();
    const seconds = Math.floor(duration);
    const started = new Date(ended.getTime() - seconds * 1000);
    await supabase.from("reading_sessions").insert({
      user_id: user.id,
      material_id: input.materialId,
      started_at: started.toISOString(),
      ended_at: ended.toISOString(),
      duration_seconds: seconds,
      units_delta: Math.floor(unitsDelta),
    });
  }

  revalidateMaterialPaths(data.id, data.google_books_id);
  refresh();
  return { ok: true, data };
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
  if (!data) {
    return { ok: false, error: "notFound" };
  }

  revalidateMaterialPaths(data.id, data.google_books_id);
  return { ok: true, data };
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

  revalidateMaterialPaths(data.id, data.google_books_id);
  return { ok: true, data };
}

export async function updateMaterialMetric(
  materialId: string,
  metricType: MetricType,
): Promise<ActionResult<Material>> {
  if (!isMetricType(metricType)) {
    return { ok: false, error: "generic" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "authRequired" };
  }

  const { data, error } = await supabase
    .from("materials")
    .update({
      metric_type: metricType,
      updated_at: new Date().toISOString(),
    })
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

  revalidateMaterialPaths(data.id, data.google_books_id);
  refresh();
  return { ok: true, data };
}

/** pages keyed by logged_on (YYYY-MM-DD local calendar day from client). */
export type HeatmapDayEntry = {
  materialId: string;
  title: string;
  metricType: MetricType;
  delta: number;
};

export type HeatmapData = {
  totals: Record<string, number>;
  entries: Record<string, HeatmapDayEntry[]>;
};

export async function getHeatmapData(fromDate: string): Promise<HeatmapData> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fromDate)) {
    return { totals: {}, entries: {} };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { totals: {}, entries: {} };

  const { data, error } = await supabase
    .from("progress_entries")
    .select(
      "logged_on, pages_delta, material_id, materials(title, metric_type)",
    )
    .eq("user_id", user.id)
    .gte("logged_on", fromDate)
    .order("created_at", { ascending: true });

  if (error) throw error;

  const totals: Record<string, number> = {};
  const grouped = new Map<string, Map<string, HeatmapDayEntry>>();

  for (const row of data ?? []) {
    totals[row.logged_on] = (totals[row.logged_on] ?? 0) + row.pages_delta;
    const material = nestedMaterial(row.materials);
    const byMaterial = grouped.get(row.logged_on) ?? new Map();
    const existing = byMaterial.get(row.material_id);
    if (existing) {
      existing.delta += row.pages_delta;
    } else {
      byMaterial.set(row.material_id, {
        materialId: row.material_id,
        title: material?.title?.trim() || "—",
        metricType:
          material?.metric_type && isMetricType(material.metric_type)
            ? material.metric_type
            : "pages",
        delta: row.pages_delta,
      });
    }
    grouped.set(row.logged_on, byMaterial);
  }

  const entries: Record<string, HeatmapDayEntry[]> = {};
  for (const [date, byMaterial] of grouped) {
    entries[date] = [...byMaterial.values()]
      .filter((item) => item.delta !== 0)
      .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  }

  return { totals, entries };
}

function nestedMaterial(
  value: unknown,
): { title: string | null; metric_type: string | null } | null {
  if (!value || typeof value !== "object") return null;
  const row = Array.isArray(value) ? value[0] : value;
  if (!row || typeof row !== "object") return null;
  const title = "title" in row ? row.title : null;
  const metricType = "metric_type" in row ? row.metric_type : null;
  return {
    title: typeof title === "string" ? title : null,
    metric_type: typeof metricType === "string" ? metricType : null,
  };
}

export async function getMaterialNote(
  materialId: string,
): Promise<MaterialNote | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("material_notes")
    .select("*")
    .eq("user_id", user.id)
    .eq("material_id", materialId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function upsertMaterialNote(input: {
  materialId: string;
  body: string;
}): Promise<ActionResult<MaterialNote>> {
  const body = input.body.slice(0, 20000);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "authRequired" };
  }

  const { data: existing } = await supabase
    .from("material_notes")
    .select("id")
    .eq("user_id", user.id)
    .eq("material_id", input.materialId)
    .maybeSingle();

  const now = new Date().toISOString();
  const query = existing
    ? supabase
        .from("material_notes")
        .update({ body, updated_at: now })
        .eq("id", existing.id)
        .select()
        .single()
    : supabase
        .from("material_notes")
        .insert({
          user_id: user.id,
          material_id: input.materialId,
          body,
        })
        .select()
        .single();

  const { data, error } = await query;
  if (error || !data) {
    return { ok: false, error: "generic" };
  }

  revalidateMaterialPaths(input.materialId);
  return { ok: true, data };
}

export async function getMaterialPace(
  materialId: string,
): Promise<number | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("reading_sessions")
    .select("duration_seconds, units_delta")
    .eq("user_id", user.id)
    .eq("material_id", materialId)
    .not("units_delta", "is", null);

  if (error) throw error;
  let seconds = 0;
  let units = 0;
  for (const row of data ?? []) {
    if (!row.units_delta) continue;
    seconds += row.duration_seconds;
    units += row.units_delta;
  }
  if (seconds <= 0 || units <= 0) return null;
  return Math.round((units / seconds) * 3600);
}
