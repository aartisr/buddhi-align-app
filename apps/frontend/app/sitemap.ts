import type { MetadataRoute } from "next";
import { AUTOGRAPH_FEATURE_ENABLED } from "./lib/autographs/feature";
import { publicPageProfiles } from "./lib/public-content";
import { getSiteUrl } from "./lib/site-url";
import { getCommunityConfig } from "./lib/community-config";
import { MODULE_CATEGORY_SLUGS } from "./lib/community/module-map";

const baseUrl = getSiteUrl();

export const dynamic = "force-dynamic";

function buildCommunityDiscussionRoutes(): MetadataRoute.Sitemap {
  const config = getCommunityConfig();
  const communityProfile = publicPageProfiles.find((profile) => profile.path === "/community");
  const lastModified = communityProfile?.lastModified;
  const parentCategorySlug = config.discourse?.parentCategorySlug
    ?? config.discourse?.defaultCategorySlug
    ?? "buddhi-align";
  const routePaths = new Set<string>();

  for (const categorySlug of Object.values(MODULE_CATEGORY_SLUGS)) {
    if (categorySlug) {
      routePaths.add(
        `/community/c/${encodeURIComponent(parentCategorySlug)}/${encodeURIComponent(categorySlug)}`,
      );
    }
  }

  return Array.from(routePaths).map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = publicPageProfiles.map((profile) => ({
    url: `${baseUrl}${profile.path === "/" ? "/" : profile.path}`,
    lastModified: profile.lastModified,
    changeFrequency: profile.changeFrequency,
    priority: profile.priority,
  }));
  const communityDiscussionRoutes = buildCommunityDiscussionRoutes();

  if (!AUTOGRAPH_FEATURE_ENABLED) {
    return [...routes, ...communityDiscussionRoutes];
  }

  try {
    const { autographService } = await import("./lib/autographs/service");
    const profiles = await autographService.listPublicAutographProfiles();
    const profileRoutes = profiles.map((profile) => ({
      url: `${baseUrl}/profiles/${encodeURIComponent(profile.id)}`,
      lastModified: profile.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.68,
    }));

    return [...routes, ...communityDiscussionRoutes, ...profileRoutes];
  } catch {
    return [...routes, ...communityDiscussionRoutes];
  }
}
