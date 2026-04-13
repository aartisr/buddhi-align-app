import type { CommunityConfig } from "./community-config";
import type { CommunityProviderAdapter } from "./community/provider-types";
import {
  isCommunityModuleKey,
  getModuleCategorySlug,
  type CommunityModuleKey,
} from "./community/module-map";
import { buildDiscourseCommunityUrl } from "./community/providers/discourse-provider";
import { getCommunityProviderAdapter } from "./community/providers/registry";

export { isCommunityModuleKey, getModuleCategorySlug, type CommunityModuleKey, buildDiscourseCommunityUrl };

export function buildCommunityUrl(
  moduleKey: CommunityModuleKey,
  config: CommunityConfig,
  additionalAdapters: readonly CommunityProviderAdapter[] = [],
): string | undefined {
  if (!config.enabled) return undefined;
  return getCommunityProviderAdapter(config.provider, additionalAdapters).buildModuleUrl(moduleKey, config);
}
