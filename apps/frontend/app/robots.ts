import type { MetadataRoute } from "next";
import { getSiteUrl } from "./lib/site-url";

const baseUrl = getSiteUrl();
const allowPublic = [
  "/",
  "/community",
  "/community/",
  "/community/c/",
  "/community/t/",
  "/about",
  "/updates",
  "/profiles",
  "/profiles/",
  "/support",
  "/feed.xml",
  "/llms.txt",
  "/llms-full.txt",
  "/opengraph-image",
  "/twitter-image",
  "/6A06157D-A0A1-46BA-BA2B-439CD61864A3.txt",
];
const disallowPrivate = [
  "/api/",
  "/admin/",
  "/admin",
  "/admin-access",
  "/settings",
  "/sign-in",
  "/community/admin",
  "/community/login",
  "/community/signup",
  "/community/session/",
  "/community/my/",
  "/community/search",
  "/community/new-topic",
];
const indexableCrawlerUserAgents = [
  "Googlebot",
  "Google-Extended",
  "Bingbot",
  "AdIdxBot",
  "DuckAssistBot",
  "Applebot",
  "Applebot-Extended",
  "GPTBot",
  "CCBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "Perplexity-User",
  "ClaudeBot",
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
    host: baseUrl,
    sitemap: [`${baseUrl}/sitemap.xml`, `${baseUrl}/community/sitemap.xml`],
  };
}
