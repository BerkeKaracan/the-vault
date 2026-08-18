import { describe, expect, it } from "vitest";
import { safeNextPath } from "@/lib/paths";

describe("safeNextPath", () => {
  it("allows in-app paths", () => {
    expect(safeNextPath("/desk")).toBe("/desk");
    expect(safeNextPath("/materials/abc")).toBe("/materials/abc");
  });

  it("rejects empty, off-site, and auth loops", () => {
    expect(safeNextPath(null)).toBe("/desk");
    expect(safeNextPath("//evil.example")).toBe("/desk");
    expect(safeNextPath("/login?next=/desk")).toBe("/desk");
    expect(safeNextPath("/auth/callback")).toBe("/desk");
    expect(safeNextPath("\\desk")).toBe("/desk");
  });
});
