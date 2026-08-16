import { cache } from "react";
import { getAuthUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type Collection = {
  id: string;
  name: string;
  created_at: string;
  materialIds: string[];
};

export const getCollections = cache(async (): Promise<Collection[]> => {
  try {
    const [supabase, user] = await Promise.all([createClient(), getAuthUser()]);
    if (!user) return [];

    const [
      { data: shelves, error: shelfError },
      { data: items, error: itemError },
    ] = await Promise.all([
      supabase
        .from("collections")
        .select("id, name, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("collection_items")
        .select("collection_id, material_id")
        .eq("user_id", user.id),
    ]);

    if (shelfError) {
      console.error("[getCollections]", shelfError.message);
      return [];
    }
    if (itemError) {
      console.error("[getCollections items]", itemError.message);
    }

    const byShelf = new Map<string, string[]>();
    for (const item of items ?? []) {
      const list = byShelf.get(item.collection_id) ?? [];
      list.push(item.material_id);
      byShelf.set(item.collection_id, list);
    }

    return (shelves ?? []).map((shelf) => ({
      id: shelf.id,
      name: shelf.name,
      created_at: shelf.created_at,
      materialIds: byShelf.get(shelf.id) ?? [],
    }));
  } catch (error) {
    console.error("[getCollections]", error);
    return [];
  }
});
