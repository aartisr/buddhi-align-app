import type { ModuleCatalogItem } from "@/app/i18n/config";

export type CommunityModuleKey = ModuleCatalogItem["key"];

export const MODULE_CATEGORY_SLUGS: Record<CommunityModuleKey, string> = {
  karma: "karma-yoga",
  bhakti: "bhakti-journal",
  jnana: "jnana-reflection",
  dhyana: "dhyana-meditation",
  vasana: "vasana-tracker",
  dharma: "dharma-planner",
  motivation: "motivation-analytics",
};

export function isCommunityModuleKey(value: string | null | undefined): value is CommunityModuleKey {
  if (!value) return false;
  return value in MODULE_CATEGORY_SLUGS;
}

export function getModuleCategorySlug(moduleKey: CommunityModuleKey): string {
  return MODULE_CATEGORY_SLUGS[moduleKey];
}
