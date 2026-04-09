import { describe, expect, it } from "vitest";

import {
  getAuthConfidenceForProvider,
  hasOidcConfidence,
  isOidcSensitivePath,
} from "./auth-confidence";

describe("auth-confidence", () => {
  it("maps providers to expected confidence", () => {
    expect(getAuthConfidenceForProvider("google")).toBe("oidc");
    expect(getAuthConfidenceForProvider("microsoft-entra-id")).toBe("oidc");
    expect(getAuthConfidenceForProvider("apple")).toBe("oidc");
    expect(getAuthConfidenceForProvider("github")).toBe("oauth");
    expect(getAuthConfidenceForProvider("facebook")).toBe("oauth");
    expect(getAuthConfidenceForProvider(undefined)).toBe("unknown");
  });

  it("accepts explicit oidc confidence and rejects oauth", () => {
    expect(hasOidcConfidence({ user: { authConfidence: "oidc" } })).toBe(true);
    expect(hasOidcConfidence({ user: { authConfidence: "oauth" } })).toBe(false);
  });

  it("falls back to provider classification", () => {
    expect(hasOidcConfidence({ user: { provider: "google" } })).toBe(true);
    expect(hasOidcConfidence({ user: { provider: "github" } })).toBe(false);
  });

  it("marks sensitive paths for OIDC enforcement", () => {
    expect(isOidcSensitivePath("/admin")).toBe(true);
    expect(isOidcSensitivePath("/admin-access")).toBe(true);
    expect(isOidcSensitivePath("/api/admin/overview")).toBe(true);
    expect(isOidcSensitivePath("/api/data/export")).toBe(true);
    expect(isOidcSensitivePath("/api/data/longitudinal")).toBe(false);
    expect(isOidcSensitivePath("/sign-in")).toBe(false);
  });
});
