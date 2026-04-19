import { describe, expect, it } from "vitest";
import { buildStableIdentityKey, resolveSessionSubject } from "./identity";

describe("auth identity stability", () => {
  it("builds provider-scoped identity key from OAuth account details", () => {
    expect(buildStableIdentityKey("google", "1234567890")).toBe("google:1234567890");
    expect(buildStableIdentityKey("  GOOGLE  ", " abc ")).toBe("google:abc");
  });

  it("returns null for incomplete account details", () => {
    expect(buildStableIdentityKey(undefined, "123")).toBeNull();
    expect(buildStableIdentityKey("google", undefined)).toBeNull();
    expect(buildStableIdentityKey("", "123")).toBeNull();
    expect(buildStableIdentityKey("google", "")).toBeNull();
  });

  it("prefers stable identity key over token.sub when resolving session subject", () => {
    expect(resolveSessionSubject("transient-sub", "google:stable-id")).toBe("google:stable-id");
  });

  it("falls back to token.sub when stable identity key is unavailable", () => {
    expect(resolveSessionSubject("legacy-sub", null)).toBe("legacy-sub");
    expect(resolveSessionSubject("legacy-sub", undefined)).toBe("legacy-sub");
  });

  it("returns null when neither identity key nor token.sub is usable", () => {
    expect(resolveSessionSubject(undefined, undefined)).toBeNull();
    expect(resolveSessionSubject("", " ")).toBeNull();
  });
});