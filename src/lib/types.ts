import type { Database } from "@/lib/database.types";

export type Material = Database["public"]["Tables"]["materials"]["Row"];
export type MaterialInsert = Database["public"]["Tables"]["materials"]["Insert"];
export type ProgressEntry =
  Database["public"]["Tables"]["progress_entries"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type MaterialSource = Database["public"]["Enums"]["material_source"];
export type MaterialStatus = Database["public"]["Enums"]["material_status"];
export type WeekStart = Database["public"]["Enums"]["week_start"];

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

/** Stable error codes mapped in i18n dictionaries.errors */
export type ActionErrorCode =
  | "deskFull"
  | "titleRequired"
  | "authRequired"
  | "invalidPage"
  | "notFound"
  | "generic";
