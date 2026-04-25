import type { CommunityConfig } from "@/app/lib/community-config";
import { validateDiscourseConfig } from "@/app/lib/discourse-config";
import { getModuleCategorySlug, type CommunityModuleKey } from "../module-map";
import type { CommunityProviderAdapter } from "../provider-types";

function joinUrlPath(basePathname: string, suffixPathname: string): string {
  const normalizedBase = basePathname.endsWith("/")
    ? basePathname.slice(0, -1)
    : basePathname;
  const normalizedSuffix = suffixPathname.startsWith("/")
    ? suffixPathname
    : `/${suffixPathname}`;

  if (!normalizedBase || normalizedBase === "/") {
    return normalizedSuffix;
  }

  return `${normalizedBase}${normalizedSuffix}`;
}

export function buildDiscourseCommunityUrl(
  moduleKey: CommunityModuleKey,
  config: CommunityConfig,
): string | undefined {
  const discourseConfig = config.discourse;
  if (!config.enabled || config.provider !== "discourse" || !discourseConfig?.enabled) {
    return undefined;
  }

  const categorySlug = getModuleCategorySlug(moduleKey) || discourseConfig.defaultCategorySlug || "community";
  const parentCategorySlug = discourseConfig.parentCategorySlug?.trim();
  const categoryPathSuffix = parentCategorySlug
    ? `/c/${encodeURIComponent(parentCategorySlug)}/${encodeURIComponent(categorySlug)}`
    : `/c/${encodeURIComponent(categorySlug)}`;
  return joinUrlPath("/community", categoryPathSuffix);
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
