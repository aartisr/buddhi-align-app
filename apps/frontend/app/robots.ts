import type { MetadataRoute } from "next";
import { getSiteUrl } from "./lib/site-url";

const baseUrl = getSiteUrl();
const allowPublic = [
  "/",
  "/profiles",
  "/profiles/",
  "/llms.txt",
  "/llms-full.txt",
  "/opengraph-image",
  "/twitter-image",
  "/6A06157D-A0A1-46BA-BA2B-439CD61864A3.txt",
];
const disallowPrivate = ["/api/", "/admin/", "/admin", "/admin-access", "/settings", "/sign-in"];
const indexableCrawlerUserAgents = [
  "Googlebot",
  "Bingbot",
  "AdIdxBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "Perplexity-User",
  "Claude-SearchBot",
  "Claude-User",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      ...indexableCrawlerUserAgents.map((userAgent) => ({
        userAgent,
        allow: allowPublic,
        disallow: disallowPrivate,
      })),
      {
        userAgent: "*",
        allow: allowPublic,
        disallow: disallowPrivate,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
