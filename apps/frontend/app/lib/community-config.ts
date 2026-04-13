import {
  getDiscourseConfig,
  type DiscourseConfig,
} from "./discourse-config";
import type { CommunityProviderAdapter } from "./community/provider-types";
import { getCommunityProviderAdapter } from "./community/providers/registry";

type EnvMap = Record<string, string | undefined>;

export type CommunityProvider = "none" | "discourse";
export type CommunityProviderId = CommunityProvider | (string & {});

export interface CommunityConfig {
  enabled: boolean;
  provider: CommunityProviderId;
  discourse?: DiscourseConfig;
}

export interface CommunityConfigValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

function parseBooleanEnv(value: string | undefined): boolean {
  if (!value) return false;
  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}

function parseProvider(value: string | undefined): CommunityProviderId | undefined {
  const normalized = value?.trim().toLowerCase();
  return normalized ? (normalized as CommunityProviderId) : undefined;
}

export function getCommunityConfig(env: EnvMap = process.env): CommunityConfig {
  const explicitProvider = parseProvider(env.COMMUNITY_INTEGRATION_PROVIDER);
  const legacyDiscourseEnabled = parseBooleanEnv(env.DISCOURSE_INTEGRATION_ENABLED);

  const provider: CommunityProviderId = explicitProvider
    ?? (legacyDiscourseEnabled ? "discourse" : "none");

  if (provider === "none") {
    return {
      enabled: false,
      provider,
    };
  }

  const discourse = provider === "discourse"
    ? getDiscourseConfig({
      ...env,
      DISCOURSE_INTEGRATION_ENABLED: "true",
    })
    : undefined;

  return {
    enabled: true,
    provider,
    discourse,
  };
}

export function validateCommunityConfig(config: CommunityConfig): CommunityConfigValidationResult {
  return getCommunityProviderAdapter(config.provider).validate(config);
}

export function validateCommunityConfigWithAdapters(
  config: CommunityConfig,
  additionalAdapters: CommunityProviderAdapter[],
): CommunityConfigValidationResult {
  return getCommunityProviderAdapter(config.provider, additionalAdapters).validate(config);
}
