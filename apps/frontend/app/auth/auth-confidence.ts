export type AuthConfidence = "oidc" | "oauth" | "unknown";

const OIDC_PROVIDERS = new Set(["google", "microsoft-entra-id", "apple"]);

const OIDC_SENSITIVE_PATH_PREFIXES = [
  "/admin",
  "/admin-access",
  "/api/admin",
  "/api/data/export",
] as const;

export function getAuthConfidenceForProvider(provider?: string): AuthConfidence {
  if (!provider) return "unknown";
  if (OIDC_PROVIDERS.has(provider)) return "oidc";
  return "oauth";
}

export function hasOidcConfidence(
  session?: { user?: unknown } | null,
): boolean {
  const user =
    session?.user && typeof session.user === "object"
      ? (session.user as { provider?: string; authConfidence?: string })
      : undefined;

  const explicit = user?.authConfidence;
  if (explicit === "oidc") return true;
  if (explicit === "oauth" || explicit === "unknown") return false;
  return getAuthConfidenceForProvider(user?.provider) === "oidc";
}

export function isOidcSensitivePath(pathname: string): boolean {
  return OIDC_SENSITIVE_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
