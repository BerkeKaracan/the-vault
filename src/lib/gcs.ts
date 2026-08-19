import { Storage } from "@google-cloud/storage";
import { coverExtensionFor } from "@/lib/cover";
import type { ActionErrorCode } from "@/lib/types";

export { COVER_MAX_BYTES, coverExtensionFor } from "@/lib/cover";

function gcsConfig() {
  const bucket = process.env.GCS_BUCKET?.trim();
  const clientEmail = process.env.GCS_CLIENT_EMAIL?.trim();
  const privateKey = process.env.GCS_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!bucket || !clientEmail || !privateKey) return null;
  return { bucket, clientEmail, privateKey };
}

export function isGcsConfigured() {
  return gcsConfig() !== null;
}

function projectIdFromEmail(email: string) {
  const domain = email.split("@")[1] ?? "";
  const suffix = ".iam.gserviceaccount.com";
  if (!domain.endsWith(suffix)) return undefined;
  return domain.slice(0, -suffix.length);
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

  if (!coverExtensionFor(input.contentType)) {
    return { error: "coverType" };
  }

  try {
    const storage = new Storage({
      projectId: projectIdFromEmail(config.clientEmail),
      credentials: {
        client_email: config.clientEmail,
        private_key: config.privateKey,
      },
    });
    const path = `covers/${input.userId}/${input.objectId}.${input.extension}`;
    const file = storage.bucket(config.bucket).file(path);
    await file.save(input.buffer, {
      resumable: false,
      contentType: input.contentType,
      metadata: { cacheControl: "public, max-age=31536000, immutable" },
    });
    const url = `https://storage.googleapis.com/${config.bucket}/${path}`;
    return { url };
  } catch {
    return { error: "coverFailed" };
  }
}
