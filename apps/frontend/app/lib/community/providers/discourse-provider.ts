import type { CommunityConfig } from "@/app/lib/community-config";
import { validateDiscourseConfig } from "@/app/lib/discourse-config";
import { getModuleCategorySlug, type CommunityModuleKey } from "../module-map";
import type { CommunityProviderAdapter } from "../provider-types";

function isSafeHttpUrl(value?: string): boolean {
  if (!value) return false;

  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export function buildDiscourseCommunityUrl(
  moduleKey: CommunityModuleKey,
  config: CommunityConfig,
): string | undefined {
  const discourseConfig = config.discourse;
  if (!config.enabled || config.provider !== "discourse" || !discourseConfig?.enabled) {
    return undefined;
  }

  const base = discourseConfig.communityUrl ?? discourseConfig.baseUrl;
  if (!isSafeHttpUrl(base)) return undefined;

  const categorySlug = getModuleCategorySlug(moduleKey) || discourseConfig.defaultCategorySlug || "community";
  const resolved = new URL(`/c/${encodeURIComponent(categorySlug)}`, base);
  return resolved.toString().replace(/\/$/, "");
}

export const discourseCommunityProviderAdapter: CommunityProviderAdapter = {
  provider: "discourse",
  buildModuleUrl: (moduleKey, config) => buildDiscourseCommunityUrl(moduleKey, config),
  validate: (config) => {
    if (config.provider !== "discourse" || !config.discourse) {
      return {
        ok: false,
        errors: ["Discourse provider configuration is missing."],
        warnings: [],
      };
    }

    const result = validateDiscourseConfig({
      ...config.discourse,
      enabled: true,
    });

    return {
      ok: result.ok,
      errors: result.errors,
      warnings: result.warnings,
    };
  },
};
