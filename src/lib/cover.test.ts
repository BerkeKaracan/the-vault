import { describe, expect, it } from "vitest";
import { COVER_MAX_BYTES, coverExtensionFor } from "@/lib/cover";

describe("cover upload rules", () => {
  it("maps allowed mime types", () => {
    expect(coverExtensionFor("image/jpg")).toBe("jpg");
    expect(coverExtensionFor("", "cover.JPEG")).toBe("jpg");
    expect(coverExtensionFor("image/gif")).toBeNull();
  });

  it("caps files at 2 MB", () => {
    expect(COVER_MAX_BYTES).toBe(2 * 1024 * 1024);
  });
});
