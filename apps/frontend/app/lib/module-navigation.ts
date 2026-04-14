import { MODULE_CATALOG } from "@/app/i18n/config";

export const RECOMMENDED_SEQUENCE = [
  "dharma",
  "karma",
  "bhakti",
  "dhyana",
  "autograph",
  "jnana",
  "vasana",
  "motivation",
] as const;

export type RecommendedModuleKey = (typeof RECOMMENDED_SEQUENCE)[number];

export const MODULE_KEYS_BY_GROUP = {
  home: ["dashboard"] as const,
  practice: ["karma", "bhakti", "dhyana"] as const,
  reflection: ["autograph", "jnana", "vasana"] as const,
  insights: ["dharma", "motivation"] as const,
} as const;

export const MODULE_BY_KEY = new Map(MODULE_CATALOG.map((item) => [item.key, item] as const));

export function getAdjacentModuleKeys(currentKey?: string | null): {
  sequenceIndex: number;
  previousModuleKey: RecommendedModuleKey | null;
  nextModuleKey: RecommendedModuleKey | null;
} {
  const sequenceIndex = currentKey ? RECOMMENDED_SEQUENCE.indexOf(currentKey as (typeof RECOMMENDED_SEQUENCE)[number]) : -1;

  if (sequenceIndex < 0) {
    return {
      sequenceIndex,
      previousModuleKey: null,
      nextModuleKey: null,
    };
  }

  return {
    sequenceIndex,
    previousModuleKey: sequenceIndex > 0 ? RECOMMENDED_SEQUENCE[sequenceIndex - 1] : null,
    nextModuleKey: sequenceIndex < RECOMMENDED_SEQUENCE.length - 1 ? RECOMMENDED_SEQUENCE[sequenceIndex + 1] : null,
  };
}
