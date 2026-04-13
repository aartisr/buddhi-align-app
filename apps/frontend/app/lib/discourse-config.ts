export interface DiscourseConfig {
  enabled: boolean;
  baseUrl?: string;
  communityUrl?: string;
  parentCategorySlug?: string;
  apiUsername?: string;
  apiKey?: string;
  ssoSecret?: string;
  ssoDefaultGroups: string[];
  ssoAdminGroups: string[];
  ssoModeratorGroups: string[];
  ssoAllowedGroups: string[];
  ssoDeniedGroups: string[];
  ssoGrantAdminFromAppAdmin: boolean;
  ssoGrantModeratorFromAppAdmin: boolean;
  ssoGroupSyncMode: "add" | "sync";
  defaultCategorySlug?: string;
  requestTimeoutMs: number;
}

export interface DiscourseConfigValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

type EnvMap = Record<string, string | undefined>;

const DEFAULT_REQUEST_TIMEOUT_MS = 4000;

function parseBooleanEnv(value: string | undefined): boolean {
  if (!value) return false;
  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}

function parsePositiveIntEnv(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.floor(parsed);
}

function normalizeUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  try {
    return new URL(trimmed).toString().replace(/\/$/, "");
  } catch {
    return undefined;
  }
}

function normalizeOptional(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function parseCsvEnv(value: string | undefined): string[] {
  if (!value) return [];
  const deduped = new Set<string>();

  for (const token of value.split(",")) {
    const normalized = token.trim().toLowerCase().replace(/\s+/g, "-");
    if (!normalized) continue;
    deduped.add(normalized);
  }

  return Array.from(deduped);
}

function parseSsoGroupSyncMode(value: string | undefined): "add" | "sync" {
  const normalized = value?.trim().toLowerCase();
  return normalized === "sync" ? "sync" : "add";
}

export function getDiscourseConfig(env: EnvMap = process.env): DiscourseConfig {
  return {
    enabled: parseBooleanEnv(env.DISCOURSE_INTEGRATION_ENABLED),
    baseUrl: normalizeUrl(env.DISCOURSE_BASE_URL),
    communityUrl: normalizeUrl(env.NEXT_PUBLIC_DISCOURSE_COMMUNITY_URL),
    parentCategorySlug: normalizeOptional(env.DISCOURSE_PARENT_CATEGORY_SLUG)?.toLowerCase(),
    apiUsername: normalizeOptional(env.DISCOURSE_API_USERNAME),
    apiKey: normalizeOptional(env.DISCOURSE_API_KEY),
    ssoSecret: normalizeOptional(env.DISCOURSE_SSO_SECRET),
    ssoDefaultGroups: parseCsvEnv(env.DISCOURSE_SSO_DEFAULT_GROUPS),
    ssoAdminGroups: parseCsvEnv(env.DISCOURSE_SSO_ADMIN_GROUPS),
    ssoModeratorGroups: parseCsvEnv(env.DISCOURSE_SSO_MODERATOR_GROUPS),
    ssoAllowedGroups: parseCsvEnv(env.DISCOURSE_SSO_ALLOWED_GROUPS),
    ssoDeniedGroups: parseCsvEnv(env.DISCOURSE_SSO_DENIED_GROUPS),
    ssoGrantAdminFromAppAdmin: parseBooleanEnv(env.DISCOURSE_SSO_GRANT_ADMIN_FROM_APP_ADMIN),
    ssoGrantModeratorFromAppAdmin: parseBooleanEnv(
      env.DISCOURSE_SSO_GRANT_MODERATOR_FROM_APP_ADMIN,
    ),
    ssoGroupSyncMode: parseSsoGroupSyncMode(env.DISCOURSE_SSO_GROUP_SYNC_MODE),
    defaultCategorySlug: normalizeOptional(env.DISCOURSE_DEFAULT_CATEGORY_SLUG),
    requestTimeoutMs: parsePositiveIntEnv(env.DISCOURSE_REQUEST_TIMEOUT_MS, DEFAULT_REQUEST_TIMEOUT_MS),
  };
}

export function validateDiscourseConfig(config: DiscourseConfig): DiscourseConfigValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!config.enabled) {
    return { ok: true, errors, warnings };
  }

  if (!config.baseUrl) {
    errors.push("DISCOURSE_BASE_URL is required when discourse integration is enabled.");
  }

  if (!config.communityUrl) {
    warnings.push(
      "NEXT_PUBLIC_DISCOURSE_COMMUNITY_URL is not set; client-side community links will be unavailable.",
    );
  }

  if (!config.apiUsername) {
    warnings.push("DISCOURSE_API_USERNAME is not set; server API calls may be limited.");
  }

  if (!config.apiKey) {
    warnings.push("DISCOURSE_API_KEY is not set; server API calls may be limited.");
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}

export function isDiscourseEnabled(env: EnvMap = process.env): boolean {
  return getDiscourseConfig(env).enabled;
}
