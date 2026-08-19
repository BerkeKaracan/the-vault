import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import type { ErrorKey } from "@/i18n/dictionaries";
import { getAuthUser } from "@/lib/auth";
import { COVER_MAX_BYTES, coverExtensionFor } from "@/lib/cover";
import { isGcsConfigured, uploadPublicCover } from "@/lib/gcs";

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json(
      { error: "authRequired" satisfies ErrorKey },
      { status: 401 },
    );
  }

  if (!isGcsConfigured()) {
    return NextResponse.json(
      { error: "coverUnavailable" satisfies ErrorKey },
      { status: 503 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof Blob) || file.size === 0) {
    return NextResponse.json(
      { error: "coverType" satisfies ErrorKey },
      { status: 400 },
    );
  }
  if (file.size > COVER_MAX_BYTES) {
    return NextResponse.json(
      { error: "coverTooLarge" satisfies ErrorKey },
      { status: 413 },
    );
  }

  const contentType = file.type;
  const fileName = file instanceof File ? file.name : "";
  const extension = coverExtensionFor(contentType, fileName);
  if (!extension) {
    return NextResponse.json(
      { error: "coverType" satisfies ErrorKey },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const uploaded = await uploadPublicCover({
    userId: user.id,
    objectId: randomUUID(),
    buffer,
    contentType,
    extension,
  });

  if ("error" in uploaded) {
    return NextResponse.json(
      { error: uploaded.error satisfies ErrorKey },
      { status: 502 },
    );
  }

  return NextResponse.json({ url: uploaded.url });
}
