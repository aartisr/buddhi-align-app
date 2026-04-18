import type { ModuleCatalogItem } from "@/app/i18n/config";
import { AUTOGRAPH_COMMUNITY_SLUG, AUTOGRAPH_FEATURE_ENABLED } from "@/app/lib/autographs/feature";

export type CommunityModuleKey = ModuleCatalogItem["key"];

export const MODULE_CATEGORY_SLUGS: Partial<Record<CommunityModuleKey, string>> = {
  karma: "karma-yoga",
  bhakti: "bhakti-journal",
  jnana: "jnana-reflection",
  dhyana: "dhyana-meditation",
  vasana: "vasana-tracker",
  dharma: "dharma-planner",
  motivation: "motivation-analytics",
  ...(AUTOGRAPH_FEATURE_ENABLED ? { autograph: AUTOGRAPH_COMMUNITY_SLUG } : {}),
};

export function isCommunityModuleKey(value: string | null | undefined): value is CommunityModuleKey {
  if (!value) return false;
  return value in MODULE_CATEGORY_SLUGS;
}

export function getModuleCategorySlug(moduleKey: CommunityModuleKey): string {
  const slug = MODULE_CATEGORY_SLUGS[moduleKey];
  if (!slug) {
    throw new Error(`Community module "${moduleKey}" is not enabled.`);
  }
  return slug;
}
