import { isAutographFeatureEnabled } from "@/app/lib/autographs/feature";
import {
  getCommunityCategoryData,
  getCommunityOverviewData,
  type CommunityCategoryCard,
  type CommunityCategoryData,
  type CommunityOverviewData,
  type CommunityTopicSummary,
} from "@/app/lib/community/discourse-api";
import { buildAutographProfileDescription } from "@/app/lib/seo";

import { searchCopilotDocuments } from "./local-retrieval-provider";
import type { CopilotDocument, CopilotRetrievalProvider, CopilotRetrievalQuery } from "./types";

const DEFAULT_DYNAMIC_SOURCE_TIMEOUT_MS = 2200;
const MAX_DYNAMIC_CATEGORY_DETAILS = 3;

type CopilotAutographProfile = {
  id: string;
  displayName: string;
  role: string;
  headline?: string;
  bio?: string;
  affiliation?: string;
  location?: string;
  subjects?: string[];
  interests?: string[];
  signaturePrompt?: string;
  updatedAt: string;
};

export type DynamicSourceLoaders = {
  getCommunityOverviewData: () => Promise<CommunityOverviewData>;
  getCommunityCategoryData: (categoryPath: readonly string[]) => Promise<CommunityCategoryData | null>;
  listPublicAutographProfiles: () => Promise<CopilotAutographProfile[]>;
};

const defaultLoaders: DynamicSourceLoaders = {
  getCommunityOverviewData,
  getCommunityCategoryData,
  listPublicAutographProfiles: async () => {
    if (!canLoadAutographService()) return [];
    const { autographService } = await import("@/app/lib/autographs/service");
    return autographService.listPublicAutographProfiles();
  },
};

function canLoadAutographService(): boolean {
  const provider = (process.env.DATA_PROVIDER ?? "supabase").toLowerCase();
  if (provider === "memory") return true;
  if (provider !== "supabase") return true;
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function wantsSource(query: CopilotRetrievalQuery, sourcePrefix: "community" | "autograph"): boolean {
  if (!query.sourceTypes?.length) return false;
  return query.sourceTypes.some((sourceType) => sourceType.startsWith(sourcePrefix));
}

function safeText(parts: Array<string | undefined | null>): string {
  return parts
    .filter((part): part is string => Boolean(part?.trim()))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, fallback: T): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<T>((resolve) => {
    timeout = setTimeout(() => resolve(fallback), timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeout) clearTimeout(timeout);
  });
}

export function communityCategoryToCopilotDocument(category: CommunityCategoryCard): CopilotDocument {
  const meta = [
    category.topicCount !== undefined ? `${category.topicCount} topics` : undefined,
    category.postCount !== undefined ? `${category.postCount} posts` : undefined,
  ].filter(Boolean).join(", ");

  return {
    id: `community-category:${category.id ?? category.slug}`,
    sourceType: "community_category",
    title: `${category.name} Community`,
    url: category.href,
    text: safeText([
      `${category.name} community discussion space.`,
      category.description,
      meta ? `Activity: ${meta}.` : undefined,
      category.moduleKey ? `Module: ${category.moduleKey}.` : undefined,
    ]),
    summary: category.description,
    moduleKey: category.moduleKey,
    visibility: "public",
    metadata: {
      slug: category.slug,
      ...(typeof category.topicCount === "number" ? { topicCount: category.topicCount } : {}),
      ...(typeof category.postCount === "number" ? { postCount: category.postCount } : {}),
    },
  };
}

function communityTopicToCopilotDocument(topic: CommunityTopicSummary, category: CommunityCategoryCard): CopilotDocument {
  return {
    id: `community-topic:${topic.id}`,
    sourceType: "community_topic",
    title: topic.title,
    url: topic.href,
    text: safeText([
      topic.title,
      topic.excerpt,
      `Community topic in ${category.name}.`,
      topic.postsCount !== undefined ? `${topic.postsCount} posts.` : undefined,
      topic.views !== undefined ? `${topic.views} views.` : undefined,
    ]),
    summary: topic.excerpt,
    moduleKey: category.moduleKey,
    visibility: "public",
    lastModified: topic.bumpedAt ?? topic.createdAt,
    metadata: {
      categorySlug: category.slug,
      topicId: topic.id,
      ...(typeof topic.postsCount === "number" ? { postsCount: topic.postsCount } : {}),
    },
  };
}

export function autographProfileToCopilotDocument(profile: CopilotAutographProfile): CopilotDocument {
  const title = `${profile.displayName} Autograph Profile`;
  const summary = buildAutographProfileDescription(profile);

  return {
    id: `autograph-profile:${profile.id}`,
    sourceType: "autograph_profile",
    title,
    url: `/profiles/${encodeURIComponent(profile.id)}`,
    text: safeText([
      title,
      summary,
      profile.headline,
      profile.bio,
      profile.affiliation ? `Affiliation: ${profile.affiliation}.` : undefined,
      profile.location ? `Location: ${profile.location}.` : undefined,
      profile.subjects?.length ? `Subjects: ${profile.subjects.join(", ")}.` : undefined,
      profile.interests?.length ? `Interests: ${profile.interests.join(", ")}.` : undefined,
      profile.signaturePrompt ? `Signature prompt: ${profile.signaturePrompt}.` : undefined,
    ]),
    summary,
    moduleKey: "autograph",
    visibility: "public",
    lastModified: profile.updatedAt,
    metadata: {
      role: profile.role,
      profileId: profile.id,
    },
  };
}

function categoryPathFromHref(href: string): string[] {
  const prefix = "/community/c/";
  if (!href.startsWith(prefix)) return [];

  return href
    .slice(prefix.length)
    .split("/")
    .map((segment) => decodeURIComponent(segment))
    .filter(Boolean);
}

export class DynamicCopilotSourceProvider implements CopilotRetrievalProvider {
  constructor(
    private readonly loaders: DynamicSourceLoaders = defaultLoaders,
    private readonly timeoutMs: number = Number(process.env.COPILOT_DYNAMIC_SOURCE_TIMEOUT_MS) || DEFAULT_DYNAMIC_SOURCE_TIMEOUT_MS,
  ) {}

  async search(query: CopilotRetrievalQuery): Promise<CopilotDocument[]> {
    const documents = await withTimeout(this.loadDocuments(query), this.timeoutMs, [] as CopilotDocument[]);
    return searchCopilotDocuments(documents, query);
  }

  private async loadDocuments(query: CopilotRetrievalQuery): Promise<CopilotDocument[]> {
    const [communityDocuments, autographDocuments] = await Promise.all([
      wantsSource(query, "community") ? this.loadCommunityDocuments(query) : Promise.resolve([]),
      wantsSource(query, "autograph") ? this.loadAutographDocuments() : Promise.resolve([]),
    ]);

    return [...communityDocuments, ...autographDocuments];
  }

  private async loadCommunityDocuments(query: CopilotRetrievalQuery): Promise<CopilotDocument[]> {
    try {
      const overview = await this.loaders.getCommunityOverviewData();
      const categoryDocuments = overview.categories.map(communityCategoryToCopilotDocument);
      const categoryMatches = searchCopilotDocuments(categoryDocuments, {
        ...query,
        sourceTypes: ["community_category"],
        limit: MAX_DYNAMIC_CATEGORY_DETAILS,
      });
      const detailResults = await Promise.all(
        categoryMatches.map(async (document) => {
          const categoryPath = categoryPathFromHref(document.url);
          if (categoryPath.length === 0) return [];
          const detail = await this.loaders.getCommunityCategoryData(categoryPath);
          if (!detail) return [];
          return detail.topics.map((topic) => communityTopicToCopilotDocument(topic, detail.category));
        }),
      );

      return [...categoryDocuments, ...detailResults.flat()];
    } catch {
      return [];
    }
  }

  private async loadAutographDocuments(): Promise<CopilotDocument[]> {
    if (!isAutographFeatureEnabled()) return [];

    try {
      const profiles = await this.loaders.listPublicAutographProfiles();
      return profiles.map(autographProfileToCopilotDocument);
    } catch {
      return [];
    }
  }
}
