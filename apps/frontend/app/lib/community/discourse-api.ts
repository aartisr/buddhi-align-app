import { DEFAULT_LOCALE, MODULE_CATALOG, translate } from "@/app/i18n/config";
import { getCommunityConfig, validateCommunityConfig, type CommunityConfig } from "@/app/lib/community-config";
import { buildCommunityUrl } from "@/app/lib/community-links";
import { MODULE_CATEGORY_SLUGS, type CommunityModuleKey } from "./module-map";

const COMMUNITY_REVALIDATE_SECONDS = 300;
const DEFAULT_COMMUNITY_DESCRIPTION =
  "A shared Buddhi Align discussion space for practice notes, questions, and steady reflection.";

type ActiveDiscourseCommunityConfig = CommunityConfig & {
  provider: "discourse";
  discourse: NonNullable<CommunityConfig["discourse"]>;
};

type RawDiscourseCategory = {
  id: number;
  name?: string;
  slug?: string;
  color?: string | null;
  text_color?: string | null;
  description?: string | null;
  description_text?: string | null;
  topic_count?: number;
  post_count?: number;
  parent_category_id?: number | null;
  subcategory_ids?: number[];
};

type RawDiscourseCategoriesResponse = {
  category_list?: {
    categories?: RawDiscourseCategory[];
  };
};

type RawDiscourseTopic = {
  id: number;
  title?: string;
  fancy_title?: string;
  slug?: string;
  excerpt?: string | null;
  posts_count?: number;
  views?: number;
  like_count?: number;
  created_at?: string;
  bumped_at?: string;
  last_posted_at?: string;
  pinned?: boolean;
  closed?: boolean;
  archetype?: string;
};

type RawDiscourseCategoryTopicsResponse = {
  topic_list?: {
    topics?: RawDiscourseTopic[];
  };
};

type RawDiscoursePost = {
  id: number;
  username?: string;
  name?: string | null;
  cooked?: string | null;
  post_number?: number;
  created_at?: string;
};

type RawDiscourseTopicDetailResponse = {
  id: number;
  title?: string;
  fancy_title?: string;
  slug?: string;
  posts_count?: number;
  views?: number;
  like_count?: number;
  created_at?: string;
  post_stream?: {
    posts?: RawDiscoursePost[];
  };
};

export type CommunityDataStatus = "ready" | "disabled" | "misconfigured" | "unavailable";

export type CommunityCategoryCard = {
  id?: number;
  slug: string;
  name: string;
  description: string;
  href: string;
  externalUrl?: string;
  topicCount?: number;
  postCount?: number;
  color?: string;
  icon: string;
  moduleKey?: CommunityModuleKey;
};

export type CommunityTopicSummary = {
  id: number;
  slug: string;
  title: string;
  excerpt?: string;
  href: string;
  externalUrl?: string;
  postsCount?: number;
  views?: number;
  likeCount?: number;
  createdAt?: string;
  bumpedAt?: string;
  pinned?: boolean;
  closed?: boolean;
};

export type CommunityPostSummary = {
  id: number;
  username: string;
  name?: string;
  postNumber?: number;
  createdAt?: string;
  excerpt: string;
};

export type CommunityOverviewData = {
  status: CommunityDataStatus;
  categories: CommunityCategoryCard[];
  parentCategory?: CommunityCategoryCard;
  warnings: string[];
};

export type CommunityCategoryData = {
  status: CommunityDataStatus;
  category: CommunityCategoryCard;
  parentCategory?: CommunityCategoryCard;
  subcategories: CommunityCategoryCard[];
  topics: CommunityTopicSummary[];
  warnings: string[];
};

export type CommunityTopicData = {
  status: CommunityDataStatus;
  topic: {
    id: number;
    slug: string;
    title: string;
    externalUrl?: string;
    postsCount?: number;
    views?: number;
    likeCount?: number;
    createdAt?: string;
    posts: CommunityPostSummary[];
  };
  warnings: string[];
};

type ModuleCommunityFallback = {
  moduleKey: CommunityModuleKey;
  slug: string;
  name: string;
  description: string;
  icon: string;
};

const COMMUNITY_MODULE_FALLBACKS: ModuleCommunityFallback[] = Object.entries(MODULE_CATEGORY_SLUGS).flatMap(
  ([moduleKey, slug]) => {
    if (!slug) return [];
    const moduleItem = MODULE_CATALOG.find((item) => item.key === moduleKey);
    if (!moduleItem) return [];

    return [
      {
        moduleKey: moduleKey as CommunityModuleKey,
        slug,
        name: translate(DEFAULT_LOCALE, moduleItem.navKey ?? moduleItem.titleKey),
        description: translate(DEFAULT_LOCALE, moduleItem.descriptionKey),
        icon: moduleItem.icon,
      },
    ];
  },
);

const MODULE_FALLBACK_BY_SLUG = new Map(COMMUNITY_MODULE_FALLBACKS.map((item) => [item.slug, item]));

function getActiveDiscourseConfig(config: CommunityConfig): {
  status: CommunityDataStatus;
  config?: ActiveDiscourseCommunityConfig;
  warnings: string[];
} {
  const validation = validateCommunityConfig(config);

  if (!config.enabled) {
    return {
      status: "disabled",
      warnings: validation.warnings,
    };
  }

  if (!validation.ok || config.provider !== "discourse" || !config.discourse?.enabled || !config.discourse.baseUrl) {
    return {
      status: "misconfigured",
      warnings: [...validation.errors, ...validation.warnings],
    };
  }

  return {
    status: "ready",
    config: config as ActiveDiscourseCommunityConfig,
    warnings: validation.warnings,
  };
}

function normalizeSlug(value: string | undefined | null): string | undefined {
  const normalized = value?.trim().toLowerCase();
  if (!normalized || !/^[a-z0-9][a-z0-9-]*$/.test(normalized)) return undefined;
  return normalized;
}

function humanizeSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

function normalizeHexColor(value: string | null | undefined): string | undefined {
  const color = value?.trim().replace(/^#/, "");
  return color && /^[0-9a-f]{6}$/i.test(color) ? `#${color}` : undefined;
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => {
      const codePoint = Number.parseInt(hex, 16);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : "";
    })
    .replace(/&#(\d+);/g, (_, decimal: string) => {
      const codePoint = Number.parseInt(decimal, 10);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : "";
    })
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

export function plainTextFromDiscourseHtml(value: string | null | undefined): string {
  if (!value) return "";

  return decodeHtmlEntities(
    value
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .replace(/\s+([.,;:!?])/g, "$1")
    .trim();
}

function clampText(value: string | null | undefined, maxLength: number): string {
  const text = plainTextFromDiscourseHtml(value);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}...`;
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

function buildDiscourseUrl(baseUrl: string | undefined, suffixPathname: string): string | undefined {
  if (!baseUrl) return undefined;

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

export function buildInternalCommunityCategoryHref(slug: string, parentSlug?: string): string {
  const segments = parentSlug && parentSlug !== slug ? [parentSlug, slug] : [slug];
  return `/community/c/${segments.map((segment) => encodeURIComponent(segment)).join("/")}`;
}

function buildInternalCommunityTopicHref(slug: string, id: number): string {
  return `/community/t/${encodeURIComponent(slug)}/${id}`;
}

function buildExternalDiscourseCategoryUrl(
  config: ActiveDiscourseCommunityConfig,
  category: Pick<CommunityCategoryCard, "id" | "slug">,
  parentSlug?: string,
): string | undefined {
  const segments = parentSlug && parentSlug !== category.slug
    ? ["c", parentSlug, category.slug]
    : ["c", category.slug];

  if (category.id) {
    segments.push(String(category.id));
  }

  return buildDiscourseUrl(config.discourse.baseUrl, `/${segments.map(encodeURIComponent).join("/")}`);
}

function buildExternalDiscourseTopicUrl(
  config: ActiveDiscourseCommunityConfig,
  topicSlug: string,
  topicId: number,
): string | undefined {
  return buildDiscourseUrl(config.discourse.baseUrl, `/t/${encodeURIComponent(topicSlug)}/${topicId}`);
}

function getParentSlug(config: ActiveDiscourseCommunityConfig | CommunityConfig | undefined): string | undefined {
  return normalizeSlug(config?.discourse?.parentCategorySlug ?? config?.discourse?.defaultCategorySlug);
}

function buildFallbackCategoryCards(config?: CommunityConfig): CommunityCategoryCard[] {
  const parentSlug = getParentSlug(config);

  return COMMUNITY_MODULE_FALLBACKS.map((item) => ({
    slug: item.slug,
    name: item.name,
    description: item.description,
    href: buildInternalCommunityCategoryHref(item.slug, parentSlug),
    externalUrl: config?.enabled ? buildCommunityUrl(item.moduleKey, config) : undefined,
    icon: item.icon,
    moduleKey: item.moduleKey,
  }));
}

function buildFallbackCategoryCard(slug: string, config?: CommunityConfig): CommunityCategoryCard {
  const fallback = MODULE_FALLBACK_BY_SLUG.get(slug);
  const parentSlug = getParentSlug(config);

  return {
    slug,
    name: fallback?.name ?? humanizeSlug(slug),
    description: fallback?.description ?? DEFAULT_COMMUNITY_DESCRIPTION,
    href: buildInternalCommunityCategoryHref(slug, parentSlug),
    externalUrl: fallback && config?.enabled ? buildCommunityUrl(fallback.moduleKey, config) : undefined,
    icon: fallback?.icon ?? "+",
    moduleKey: fallback?.moduleKey,
  };
}

function mapCategoryToCard(
  category: RawDiscourseCategory,
  config: ActiveDiscourseCommunityConfig,
  parentSlug?: string,
): CommunityCategoryCard | null {
  const slug = normalizeSlug(category.slug);
  if (!slug) return null;

  const fallback = MODULE_FALLBACK_BY_SLUG.get(slug);
  const description = clampText(category.description_text ?? category.description, 220)
    || fallback?.description
    || DEFAULT_COMMUNITY_DESCRIPTION;

  return {
    id: category.id,
    slug,
    name: category.name?.trim() || fallback?.name || humanizeSlug(slug),
    description,
    href: buildInternalCommunityCategoryHref(slug, parentSlug),
    externalUrl: buildExternalDiscourseCategoryUrl(config, { id: category.id, slug }, parentSlug),
    topicCount: category.topic_count,
    postCount: category.post_count,
    color: normalizeHexColor(category.color),
    icon: fallback?.icon ?? "+",
    moduleKey: fallback?.moduleKey,
  };
}

function getCategoryHierarchy(
  categories: RawDiscourseCategory[],
  config: ActiveDiscourseCommunityConfig,
) {
  const configuredParentSlug = getParentSlug(config);
  const moduleSlugs = new Set(COMMUNITY_MODULE_FALLBACKS.map((item) => item.slug));
  const parent = configuredParentSlug
    ? categories.find((category) => normalizeSlug(category.slug) === configuredParentSlug)
    : undefined;
  const parentChildIds = new Set(parent?.subcategory_ids ?? []);

  const subcategories = parent
    ? categories.filter((category) => category.parent_category_id === parent.id || parentChildIds.has(category.id))
    : categories.filter((category) => {
      const slug = normalizeSlug(category.slug);
      return slug ? moduleSlugs.has(slug) : false;
    });

  return {
    parent,
    subcategories,
    parentSlug: normalizeSlug(parent?.slug) ?? configuredParentSlug,
  };
}

async function fetchDiscourseJson<T>(
  config: ActiveDiscourseCommunityConfig,
  suffixPathname: string,
): Promise<T | null> {
  const url = buildDiscourseUrl(config.discourse.baseUrl, suffixPathname);
  if (!url) return null;

  const headers = new Headers({ Accept: "application/json" });
  if (config.discourse.apiUsername && config.discourse.apiKey) {
    headers.set("Api-Username", config.discourse.apiUsername);
    headers.set("Api-Key", config.discourse.apiKey);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.discourse.requestTimeoutMs);
  const init: RequestInit & { next?: { revalidate: number } } = {
    headers,
    signal: controller.signal,
    next: { revalidate: COMMUNITY_REVALIDATE_SECONDS },
  };

  try {
    const response = await fetch(url, init);
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchDiscourseCategories(
  config: ActiveDiscourseCommunityConfig,
): Promise<RawDiscourseCategory[]> {
  const payload = await fetchDiscourseJson<RawDiscourseCategoriesResponse>(config, "/categories.json");
  return payload?.category_list?.categories ?? [];
}

function getSafeCategoryPath(categoryPath: readonly string[]): string[] | null {
  const normalized = categoryPath.map((segment) => normalizeSlug(segment));
  if (normalized.some((segment) => !segment)) return null;
  return normalized as string[];
}

function buildCategoryJsonPath(category: CommunityCategoryCard, parentSlug?: string): string | undefined {
  if (!category.id) return undefined;
  const segments = parentSlug && parentSlug !== category.slug
    ? ["c", parentSlug, category.slug, String(category.id)]
    : ["c", category.slug, String(category.id)];

  return `/${segments.map(encodeURIComponent).join("/")}.json`;
}

function mapTopicToSummary(
  topic: RawDiscourseTopic,
  config: ActiveDiscourseCommunityConfig,
): CommunityTopicSummary | null {
  const slug = normalizeSlug(topic.slug) ?? `topic-${topic.id}`;
  const title = plainTextFromDiscourseHtml(topic.fancy_title ?? topic.title) || humanizeSlug(slug);

  return {
    id: topic.id,
    slug,
    title,
    excerpt: clampText(topic.excerpt, 260) || undefined,
    href: buildInternalCommunityTopicHref(slug, topic.id),
    externalUrl: buildExternalDiscourseTopicUrl(config, slug, topic.id),
    postsCount: topic.posts_count,
    views: topic.views,
    likeCount: topic.like_count,
    createdAt: topic.created_at,
    bumpedAt: topic.last_posted_at ?? topic.bumped_at,
    pinned: topic.pinned,
    closed: topic.closed,
  };
}

async function fetchCategoryTopics(
  config: ActiveDiscourseCommunityConfig,
  category: CommunityCategoryCard,
  parentSlug?: string,
): Promise<CommunityTopicSummary[]> {
  const categoryPath = buildCategoryJsonPath(category, parentSlug);
  if (!categoryPath) return [];

  const payload = await fetchDiscourseJson<RawDiscourseCategoryTopicsResponse>(config, categoryPath);
  return (payload?.topic_list?.topics ?? [])
    .filter((topic) => topic.archetype !== "private_message")
    .map((topic) => mapTopicToSummary(topic, config))
    .filter((topic): topic is CommunityTopicSummary => Boolean(topic));
}

export async function getCommunityOverviewData(
  config: CommunityConfig = getCommunityConfig(),
): Promise<CommunityOverviewData> {
  const active = getActiveDiscourseConfig(config);
  const fallbackCategories = buildFallbackCategoryCards(config);

  if (!active.config) {
    return {
      status: active.status,
      categories: fallbackCategories,
      warnings: active.warnings,
    };
  }

  const activeConfig = active.config;
  const rawCategories = await fetchDiscourseCategories(activeConfig);
  if (rawCategories.length === 0) {
    return {
      status: "unavailable",
      categories: fallbackCategories,
      warnings: active.warnings,
    };
  }

  const hierarchy = getCategoryHierarchy(rawCategories, activeConfig);
  const parentCategory = hierarchy.parent
    ? mapCategoryToCard(hierarchy.parent, activeConfig, undefined) ?? undefined
    : undefined;
  const categories = hierarchy.subcategories
    .map((category) => mapCategoryToCard(category, activeConfig, hierarchy.parentSlug))
    .filter((category): category is CommunityCategoryCard => Boolean(category));

  return {
    status: "ready",
    categories: categories.length > 0 ? categories : fallbackCategories,
    parentCategory,
    warnings: active.warnings,
  };
}

export async function getCommunityCategoryData(
  categoryPath: readonly string[],
  config: CommunityConfig = getCommunityConfig(),
): Promise<CommunityCategoryData | null> {
  const safePath = getSafeCategoryPath(categoryPath);
  if (!safePath || safePath.length === 0) return null;

  const active = getActiveDiscourseConfig(config);
  const targetSlug = safePath[safePath.length - 1];
  const fallbackCategory = buildFallbackCategoryCard(targetSlug, config);

  if (!active.config) {
    return {
      status: active.status,
      category: fallbackCategory,
      subcategories: [],
      topics: [],
      warnings: active.warnings,
    };
  }

  const activeConfig = active.config;
  const rawCategories = await fetchDiscourseCategories(activeConfig);
  if (rawCategories.length === 0) {
    return {
      status: "unavailable",
      category: fallbackCategory,
      subcategories: [],
      topics: [],
      warnings: active.warnings,
    };
  }

  const hierarchy = getCategoryHierarchy(rawCategories, activeConfig);
  const matchedCategory = rawCategories.find((category) => normalizeSlug(category.slug) === targetSlug);
  const parentSlug = safePath.length > 1 ? safePath[safePath.length - 2] : hierarchy.parentSlug;
  const category = matchedCategory
    ? mapCategoryToCard(matchedCategory, activeConfig, parentSlug) ?? fallbackCategory
    : fallbackCategory;
  const parentCategory = hierarchy.parent
    ? mapCategoryToCard(hierarchy.parent, activeConfig, undefined) ?? undefined
    : undefined;
  const subcategories = matchedCategory?.id === hierarchy.parent?.id
    ? hierarchy.subcategories
      .map((subcategory) => mapCategoryToCard(subcategory, activeConfig, hierarchy.parentSlug))
      .filter((subcategory): subcategory is CommunityCategoryCard => Boolean(subcategory))
    : [];
  const topics = await fetchCategoryTopics(activeConfig, category, parentSlug);

  return {
    status: matchedCategory ? "ready" : "unavailable",
    category,
    parentCategory,
    subcategories,
    topics,
    warnings: active.warnings,
  };
}

export async function getCommunityTopicData(
  slugParam: string,
  idParam: string,
  config: CommunityConfig = getCommunityConfig(),
): Promise<CommunityTopicData | null> {
  const slug = normalizeSlug(slugParam);
  const id = Number.parseInt(idParam, 10);
  if (!slug || !Number.isInteger(id) || id <= 0) return null;

  const active = getActiveDiscourseConfig(config);
  const fallbackTopic = {
    id,
    slug,
    title: humanizeSlug(slug),
    externalUrl: active.config ? buildExternalDiscourseTopicUrl(active.config, slug, id) : undefined,
    posts: [],
  };

  if (!active.config) {
    return {
      status: active.status,
      topic: fallbackTopic,
      warnings: active.warnings,
    };
  }

  const payload = await fetchDiscourseJson<RawDiscourseTopicDetailResponse>(active.config, `/t/${id}.json`);
  if (!payload) {
    return {
      status: "unavailable",
      topic: fallbackTopic,
      warnings: active.warnings,
    };
  }

  const resolvedSlug = normalizeSlug(payload.slug) ?? slug;
  const posts = (payload.post_stream?.posts ?? []).map((post) => ({
    id: post.id,
    username: post.username ?? "community-member",
    name: post.name ?? undefined,
    postNumber: post.post_number,
    createdAt: post.created_at,
    excerpt: clampText(post.cooked, 900),
  }));

  return {
    status: "ready",
    topic: {
      id: payload.id,
      slug: resolvedSlug,
      title: plainTextFromDiscourseHtml(payload.fancy_title ?? payload.title) || humanizeSlug(resolvedSlug),
      externalUrl: buildExternalDiscourseTopicUrl(active.config, resolvedSlug, payload.id),
      postsCount: payload.posts_count,
      views: payload.views,
      likeCount: payload.like_count,
      createdAt: payload.created_at,
      posts,
    },
    warnings: active.warnings,
  };
}
