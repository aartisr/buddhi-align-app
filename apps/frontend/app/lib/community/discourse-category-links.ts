import type { CommunityConfig } from "@/app/lib/community-config";
import {
  getModuleCategorySlug,
  MODULE_CATEGORY_SLUGS,
  type CommunityModuleKey,
} from "@/app/lib/community/module-map";

const CATEGORY_REVALIDATE_SECONDS = 300;
const COMMUNITY_ROOT_HREF = "/community";

type ActiveDiscourseConfig = NonNullable<CommunityConfig["discourse"]> & {
  enabled: true;
  baseUrl: string;
};

type RawDiscourseCategory = {
  id: number;
  slug?: string | null;
  parent_category_id?: number | null;
  subcategory_ids?: number[];
};

type RawDiscourseCategoriesResponse = {
  category_list?: {
    categories?: RawDiscourseCategory[];
  };
};

export type ResolvedDiscourseCategoryLink = {
  moduleKey: CommunityModuleKey;
  href: string;
  categoryId?: number;
};

function normalizeSlug(value: string | undefined | null): string | undefined {
  const normalized = value?.trim().toLowerCase();
  if (!normalized || !/^[a-z0-9][a-z0-9-]*$/.test(normalized)) return undefined;
  return normalized;
}

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

function buildDiscourseApiUrl(baseUrl: string, suffixPathname: string): string | undefined {
  try {
    const parsedBase = new URL(baseUrl);
    const resolved = new URL(parsedBase.toString());
    resolved.pathname = joinUrlPath(parsedBase.pathname, suffixPathname);
    resolved.search = "";
    resolved.hash = "";
    return resolved.toString();
  } catch {
    return undefined;
  }
}

function getActiveDiscourseConfig(config: CommunityConfig): ActiveDiscourseConfig | undefined {
  if (!config.enabled || config.provider !== "discourse") return undefined;
  const discourse = config.discourse;
  if (!discourse?.enabled || !discourse.baseUrl) return undefined;
  return discourse as ActiveDiscourseConfig;
}

function getConfiguredParentSlug(config: CommunityConfig, fallbackSlug?: string): string | undefined {
  return normalizeSlug(config.discourse?.parentCategorySlug ?? config.discourse?.defaultCategorySlug)
    ?? fallbackSlug;
}

export function buildCommunityCategoryHref(
  categorySlug: string,
  parentCategorySlug?: string,
  categoryId?: number,
): string {
  const segments = parentCategorySlug && parentCategorySlug !== categorySlug
    ? ["community", "c", parentCategorySlug, categorySlug]
    : ["community", "c", categorySlug];

  if (categoryId) {
    segments.push(String(categoryId));
  }

  return `/${segments.map(encodeURIComponent).join("/")}`;
}

async function fetchDiscourseCategories(
  discourse: ActiveDiscourseConfig,
): Promise<RawDiscourseCategory[]> {
  const url = buildDiscourseApiUrl(discourse.baseUrl, "/categories.json");
  if (!url) return [];

  const headers = new Headers({ Accept: "application/json" });
  if (discourse.apiUsername && discourse.apiKey) {
    headers.set("Api-Username", discourse.apiUsername);
    headers.set("Api-Key", discourse.apiKey);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), discourse.requestTimeoutMs);
  const init: RequestInit & { next?: { revalidate: number } } = {
    headers,
    signal: controller.signal,
    next: { revalidate: CATEGORY_REVALIDATE_SECONDS },
  };

  try {
    const response = await fetch(url, init);
    if (!response.ok) return [];
    const payload = (await response.json()) as RawDiscourseCategoriesResponse;
    return payload.category_list?.categories ?? [];
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

function findModuleCategory(
  categories: RawDiscourseCategory[],
  categorySlug: string,
  parentCategorySlug?: string,
) {
  const parentCategory = parentCategorySlug
    ? categories.find((category) => normalizeSlug(category.slug) === parentCategorySlug)
    : undefined;
  const parentChildIds = new Set(parentCategory?.subcategory_ids ?? []);

  return categories.find((category) => {
    if (normalizeSlug(category.slug) !== categorySlug) return false;
    if (!parentCategory) return true;
    return category.parent_category_id === parentCategory.id || parentChildIds.has(category.id);
  }) ?? categories.find((category) => normalizeSlug(category.slug) === categorySlug);
}

export async function resolveDiscourseModuleCategoryLink(
  moduleKey: CommunityModuleKey,
  config: CommunityConfig,
): Promise<ResolvedDiscourseCategoryLink | undefined> {
  const categorySlug = getModuleCategorySlug(moduleKey);
  const parentCategorySlug = getConfiguredParentSlug(config);
  const fallbackHref = buildCommunityCategoryHref(categorySlug, parentCategorySlug);
  const discourse = getActiveDiscourseConfig(config);

  if (!discourse) {
    return { moduleKey, href: fallbackHref };
  }

  const categories = await fetchDiscourseCategories(discourse);
  const category = findModuleCategory(categories, categorySlug, parentCategorySlug);
  if (!category?.id) {
    return {
      moduleKey,
      href: COMMUNITY_ROOT_HREF,
    };
  }

  return {
    moduleKey,
    href: buildCommunityCategoryHref(categorySlug, parentCategorySlug, category.id),
    categoryId: category.id,
  };
}

export async function resolveDiscourseModuleCategoryLinks(
  config: CommunityConfig,
): Promise<ResolvedDiscourseCategoryLink[]> {
  const discourse = getActiveDiscourseConfig(config);
  const categories = discourse ? await fetchDiscourseCategories(discourse) : [];
  const parentCategorySlug = getConfiguredParentSlug(config, "buddhi-align");

  return (Object.keys(MODULE_CATEGORY_SLUGS) as CommunityModuleKey[]).flatMap((moduleKey) => {
    const categorySlug = MODULE_CATEGORY_SLUGS[moduleKey];
    if (!categorySlug) return [];

    const category = findModuleCategory(categories, categorySlug, parentCategorySlug);
    if (discourse && !category?.id) return [];

    return [{
      moduleKey,
      href: buildCommunityCategoryHref(categorySlug, parentCategorySlug, category?.id),
      categoryId: category?.id,
    }];
  });
}
