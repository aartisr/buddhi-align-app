import { siteConfig } from "@buddhi-align/site-config/siteConfig";

export const AUTOGRAPH_FEATURE_KEY = "autograph";
export const AUTOGRAPH_ROUTE = "/autograph-exchange";
export const AUTOGRAPH_API_BASE = "/api/autographs";
export const AUTOGRAPH_COMMUNITY_SLUG = "autograph-exchange";
export const AUTOGRAPH_ICON = "✍️";

function readBoolean(value: string | undefined): boolean | null {
  if (!value) return null;

  const normalized = value.trim().toLowerCase();

  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return null;
}

function resolveAutographFeatureEnabled(): boolean {
  const envValue = readBoolean(process.env.NEXT_PUBLIC_ENABLE_AUTOGRAPH_EXCHANGE);
  if (envValue !== null) {
    return envValue;
  }

  return siteConfig.features?.autographExchange !== false;
}

export const AUTOGRAPH_FEATURE_ENABLED = resolveAutographFeatureEnabled();

export function isAutographFeatureEnabled(): boolean {
  return AUTOGRAPH_FEATURE_ENABLED;
}

export function getAutographFeatureStatus() {
  return {
    enabled: AUTOGRAPH_FEATURE_ENABLED,
    key: AUTOGRAPH_FEATURE_KEY,
    route: AUTOGRAPH_ROUTE,
    apiBase: AUTOGRAPH_API_BASE,
    communitySlug: AUTOGRAPH_COMMUNITY_SLUG,
  } as const;
}
