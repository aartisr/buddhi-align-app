import type { MetadataRoute } from "next";
import { getSiteUrl } from "./lib/site-url";

const baseUrl = getSiteUrl();
const allowPublic = [
  "/",
  "/llms.txt",
  "/llms-full.txt",
  "/opengraph-image",
  "/twitter-image",
  "/6A06157D-A0A1-46BA-BA2B-439CD61864A3.txt",
];
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
