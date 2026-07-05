import { publicPageProfiles } from "../lib/public-content";
import { siteDescription, siteName, siteUrl } from "../lib/seo";

export const dynamic = "force-dynamic";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const items = publicPageProfiles
    .slice()
    .sort((a, b) => (a.lastModified < b.lastModified ? 1 : -1))
    .map((profile) => {
      const url = `${siteUrl}${profile.path === "/" ? "/" : profile.path}`;
      return [
        "<item>",
        `<title>${escapeXml(profile.title)}</title>`,
        `<link>${escapeXml(url)}</link>`,
        `<guid isPermaLink=\"true\">${escapeXml(url)}</guid>`,
        `<description>${escapeXml(profile.description)}</description>`,
        `<pubDate>${new Date(profile.lastModified).toUTCString()}</pubDate>`,
        "</item>",
      ].join("");
    })
    .join("");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    "<channel>",
    `<title>${escapeXml(siteName)}</title>`,
    `<link>${escapeXml(siteUrl)}</link>`,
    `<description>${escapeXml(siteDescription)}</description>`,
    `<language>en-us</language>`,
    `<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
    items,
    "</channel>",
    "</rss>",
  ].join("");

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
