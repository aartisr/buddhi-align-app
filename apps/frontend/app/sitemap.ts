import type { MetadataRoute } from "next";
import { AUTOGRAPH_FEATURE_ENABLED } from "./lib/autographs/feature";
import { publicPageProfiles } from "./lib/public-content";
import { getSiteUrl } from "./lib/site-url";

const baseUrl = getSiteUrl();

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = publicPageProfiles.map((profile) => ({
    url: `${baseUrl}${profile.path === "/" ? "/" : profile.path}`,
    lastModified: profile.lastModified,
    changeFrequency: profile.changeFrequency,
    priority: profile.priority,
  }));

  if (!AUTOGRAPH_FEATURE_ENABLED) {
    return routes;
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

    return [...routes, ...profileRoutes];
  } catch {
    return routes;
  }
}
