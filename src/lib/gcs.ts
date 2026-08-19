import { Storage } from "@google-cloud/storage";
import type { ActionErrorCode } from "@/lib/types";

export { COVER_MAX_BYTES, coverExtensionFor } from "@/lib/cover";

export function normalizeGcsPrivateKey(raw: string): string {
  let key = raw.trim();
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }
  return key.replace(/\\n/g, "\n").replace(/\r\n/g, "\n").trim();
}

export function normalizeGcsBucket(raw: string): string {
  return raw
    .trim()
    .replace(/^gs:\/\//i, "")
    .replace(/\/+$/, "");
}

function gcsConfig() {
  const bucket = normalizeGcsBucket(process.env.GCS_BUCKET ?? "");
  const clientEmail = process.env.GCS_CLIENT_EMAIL?.trim() ?? "";
  const privateKey = normalizeGcsPrivateKey(process.env.GCS_PRIVATE_KEY ?? "");
  const projectId =
    process.env.GCS_PROJECT_ID?.trim() || projectIdFromEmail(clientEmail) || "";
  if (!bucket || !clientEmail || !privateKey.includes("BEGIN")) return null;
  return { bucket, clientEmail, privateKey, projectId };
}

export function isGcsConfigured() {
  return gcsConfig() !== null;
}

export function projectIdFromEmail(email: string) {
  const domain = email.split("@")[1] ?? "";
  const suffix = ".iam.gserviceaccount.com";
  if (!domain.endsWith(suffix)) return "";
  return domain.slice(0, -suffix.length);
}

function logGcsError(error: unknown) {
  const err = error as {
    message?: string;
    code?: string | number;
    errors?: { message?: string }[];
  };
  const detail = err.errors?.[0]?.message ?? err.message ?? String(error);
  console.error("[gcs/cover]", err.code ?? "", detail);
}

export async function uploadPublicCover(input: {
  userId: string;
  objectId: string;
  buffer: Buffer;
  contentType: string;
  extension: string;
}): Promise<{ url: string } | { error: ActionErrorCode }> {
  const config = gcsConfig();
  if (!config) {
    return { error: "coverUnavailable" };
  }

  try {
    const storage = new Storage({
      projectId: config.projectId || undefined,
      credentials: {
        type: "service_account",
        project_id: config.projectId || undefined,
        client_email: config.clientEmail,
        private_key: config.privateKey,
      },
    });
    const path = `covers/${input.userId}/${input.objectId}.${input.extension}`;
    const file = storage.bucket(config.bucket).file(path);
    await file.save(input.buffer, {
      resumable: false,
      validation: "md5",
      contentType: input.contentType || `image/${input.extension}`,
      metadata: { cacheControl: "public, max-age=31536000, immutable" },
    });
    const url = `https://storage.googleapis.com/${config.bucket}/${path}`;
    return { url };
  } catch (error) {
    logGcsError(error);
    return { error: "coverFailed" };
  }
}
