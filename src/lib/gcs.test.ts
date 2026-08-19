import { describe, expect, it } from "vitest";
import {
  normalizeGcsBucket,
  normalizeGcsPrivateKey,
  projectIdFromEmail,
} from "@/lib/gcs";

describe("gcs env parsing", () => {
  it("turns escaped PEM newlines into real ones", () => {
    const key = normalizeGcsPrivateKey(
      '"-----BEGIN PRIVATE KEY-----\\nABC\\n-----END PRIVATE KEY-----\\n"',
    );
    expect(key).toContain("BEGIN PRIVATE KEY");
    expect(key).toContain("\nABC\n");
    expect(key.includes("\\n")).toBe(false);
  });

  it("strips gs:// from the bucket name", () => {
    expect(normalizeGcsBucket("gs://vault-covers/")).toBe("vault-covers");
  });

  it("reads the project id from a service account email", () => {
    expect(
      projectIdFromEmail("covers@my-proj-123.iam.gserviceaccount.com"),
    ).toBe("my-proj-123");
  });
});
