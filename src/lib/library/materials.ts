import { unstable_rethrow } from "next/navigation";
import { cache } from "react";
import { requireUser } from "@/lib/auth";
import { isMetricType } from "@/lib/catalog/fields";
import { isGoogleVolumeId } from "@/lib/catalog/google-books";
import { isUuid } from "@/lib/ids";
import { createClient } from "@/lib/supabase/server";
import type { Material, MaterialNote } from "@/lib/types";

function normalizeMaterial(row: Material): Material {
  return {
    ...row,
    metric_type:
      typeof row.metric_type === "string" && isMetricType(row.metric_type)
        ? row.metric_type
        : "pages",
    tags: Array.isArray(row.tags) ? row.tags : [],
  };
}

export async function getActiveMaterials(): Promise<Material[]> {
  const [supabase, user] = await Promise.all([createClient(), requireUser()]);

  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[getActiveMaterials]", error.message);
    return [];
  }
  return (data ?? []).map(normalizeMaterial);
}

export async function getLibraryMaterials(): Promise<Material[]> {
  const [supabase, user] = await Promise.all([createClient(), requireUser()]);

  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[getLibraryMaterials]", error.message);
    return [];
  }
  return (data ?? []).map(normalizeMaterial);
}

export async function findMaterialByGoogleId(
  googleId: string,
): Promise<Material | null> {
  if (!isGoogleVolumeId(googleId)) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .eq("user_id", user.id)
    .eq("google_books_id", googleId)
    .maybeSingle();

  if (error) {
    console.error("[findMaterialByGoogleId]", error.message);
    return null;
  }
  return data ? normalizeMaterial(data) : null;
}

export const getMaterial = cache(
  async (id: string): Promise<Material | null> => {
    if (!isUuid(id)) return null;

    try {
      const [supabase, user] = await Promise.all([
        createClient(),
        requireUser(),
      ]);

      const { data, error } = await supabase
        .from("materials")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("[getMaterial]", error.message);
        return null;
      }
      if (!data) return null;
      return normalizeMaterial(data);
    } catch (error) {
      unstable_rethrow(error);
      console.error("[getMaterial]", error);
      return null;
    }
  },
);

export async function getMaterialNote(
  materialId: string,
): Promise<MaterialNote | null> {
  try {
    const [supabase, user] = await Promise.all([createClient(), requireUser()]);

    const { data, error } = await supabase
      .from("material_notes")
      .select("*")
      .eq("user_id", user.id)
      .eq("material_id", materialId)
      .maybeSingle();

    if (error) {
      console.error("[getMaterialNote]", error.message);
      return null;
    }
    return data;
  } catch (error) {
    unstable_rethrow(error);
    console.error("[getMaterialNote]", error);
    return null;
  }
}

export async function getMaterialPace(
  materialId: string,
): Promise<number | null> {
  try {
    const [supabase, user] = await Promise.all([createClient(), requireUser()]);

    const { data, error } = await supabase
      .from("reading_sessions")
      .select("duration_seconds, units_delta")
      .eq("user_id", user.id)
      .eq("material_id", materialId)
      .not("units_delta", "is", null);

    if (error) {
      console.error("[getMaterialPace]", error.message);
      return null;
    }
    let seconds = 0;
    let units = 0;
    for (const row of data ?? []) {
      if (!row.units_delta) continue;
      seconds += row.duration_seconds;
      units += row.units_delta;
    }
    if (seconds <= 0 || units <= 0) return null;
    return Math.round((units / seconds) * 3600);
  } catch (error) {
    unstable_rethrow(error);
    console.error("[getMaterialPace]", error);
    return null;
  }
}
