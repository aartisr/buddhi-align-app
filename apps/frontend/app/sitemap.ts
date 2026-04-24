import type { MetadataRoute } from "next";
import { publicPageProfiles } from "./lib/public-content";
import { getSiteUrl } from "./lib/site-url";

const baseUrl = getSiteUrl();

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return publicPageProfiles.map((profile) => ({
    url: `${baseUrl}${profile.path === "/" ? "/" : profile.path}`,
    lastModified: now,
    changeFrequency: profile.changeFrequency,
    priority: profile.priority,
  }));
}
