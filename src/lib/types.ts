export type MaterialSource = "google" | "custom";
export type MaterialStatus = "active" | "shelved" | "completed";

export type Material = {
  id: string;
  user_id: string;
  title: string;
  author: string | null;
  total_pages: number | null;
  current_page: number;
  cover_url: string | null;
  google_books_id: string | null;
  source: MaterialSource;
  status: MaterialStatus;
  created_at: string;
  updated_at: string;
};

export type ProgressEntry = {
  id: string;
  user_id: string;
  material_id: string;
  pages_delta: number;
  page_after: number;
  logged_on: string;
  created_at: string;
};

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

/** Stable error codes mapped in i18n dictionaries.errors */
export type ActionErrorCode =
  | "deskFull"
  | "titleRequired"
  | "authRequired"
  | "generic";
