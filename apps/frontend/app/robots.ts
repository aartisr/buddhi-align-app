import type { MetadataRoute } from "next";
import { getSiteUrl } from "./lib/site-url";

const baseUrl = getSiteUrl();
const allowPublic = ["/", "/llms.txt", "/llms-full.txt", "/opengraph-image", "/twitter-image"];
const disallowPrivate = ["/api/", "/admin/", "/admin", "/admin-access", "/settings", "/sign-in"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "Bingbot",
        allow: allowPublic,
        disallow: disallowPrivate,
      },
      {
        userAgent: "AdIdxBot",
        allow: allowPublic,
        disallow: disallowPrivate,
      },
      {
        userAgent: "*",
        allow: allowPublic,
        disallow: disallowPrivate,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
