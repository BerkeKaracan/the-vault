import { cache } from "react";
import {
  type GoogleBookResult,
  getGoogleBook,
  isGoogleVolumeId,
} from "@/lib/google-books";
import { isUuid } from "@/lib/ids";
import { createClient } from "@/lib/supabase/server";
import type { Material } from "@/lib/types";

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
  return data ?? [];
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
  return data ?? [];
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

  if (error) throw error;
  return data;
}

async function hydrateMaterial(material: Material): Promise<Material> {
  if (material.source !== "google" || !material.google_books_id) {
    return material;
  }

  const needsDescription = material.description === null;
  const needsMeta =
    !material.cover_url ||
    !material.publisher ||
    !material.published_date ||
    !material.categories ||
    !material.total_pages ||
    !material.author;

  if (!needsDescription && !needsMeta) return material;

  let book: GoogleBookResult | null;
  try {
    book = await getGoogleBook(material.google_books_id);
  } catch {
    return material;
  }
  if (!book) return material;

  const patch: {
    description?: string;
    cover_url?: string;
    publisher?: string;
    published_date?: string;
    categories?: string[];
    total_pages?: number;
    author?: string;
  } = {};

  if (needsDescription) {
    patch.description = book.description ?? "";
  }
  if (!material.cover_url && book.coverUrl) {
    patch.cover_url = book.coverUrl;
  }
  if (!material.publisher && book.publisher) {
    patch.publisher = book.publisher;
  }
  if (!material.published_date && book.publishedDate) {
    patch.published_date = book.publishedDate;
  }
  if (!material.categories && book.categories.length > 0) {
    patch.categories = book.categories;
  }
  if (!material.total_pages && book.pageCount) {
    patch.total_pages = book.pageCount;
  }
  if (!material.author && book.authors.length > 0) {
    patch.author = book.authors.join(", ");
  }

  if (Object.keys(patch).length === 0) return material;

  const hydrated: Material = { ...material, ...patch };

  const supabase = await createClient();
  const { error } = await supabase
    .from("materials")
    .update(patch)
    .eq("id", material.id)
    .eq("user_id", material.user_id);

  if (error) {
    console.error("[hydrateMaterial]", error.message);
  }

  return hydrated;
}

export const getMaterial = cache(
  async (id: string): Promise<Material | null> => {
    if (!isUuid(id)) return null;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("materials")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return hydrateMaterial(data);
  },
);
