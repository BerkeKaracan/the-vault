import type { Database } from "@/lib/database.types";

export type Material = Database["public"]["Tables"]["materials"]["Row"];
export type MaterialInsert =
  Database["public"]["Tables"]["materials"]["Insert"];
export type ProgressEntry =
  Database["public"]["Tables"]["progress_entries"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type MaterialSource = Database["public"]["Enums"]["material_source"];
export type MaterialStatus = Database["public"]["Enums"]["material_status"];
export type AccentColor = Database["public"]["Enums"]["accent_color"];
export type MetricType = Database["public"]["Enums"]["metric_type"];
export type WeekStart = Database["public"]["Enums"]["week_start"];
export type ColorScheme = Database["public"]["Enums"]["color_scheme"];
export type MaterialNote =
  Database["public"]["Tables"]["material_notes"]["Row"];
export type ReadingSession =
  Database["public"]["Tables"]["reading_sessions"]["Row"];

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
  | "alreadyOwned"
  | "generic";
