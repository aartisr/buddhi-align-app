import { describe, expect, it } from "vitest";

import robots from "../robots";
import sitemap from "../sitemap";
import {
  homepageFaq,
  PUBLIC_CONTENT_LAST_MODIFIED,
  publicPageProfiles,
  publicShareDestinations,
} from "./public-content";
import { buildHomePageJsonLd, buildPageMetadata, buildSharePageJsonLd } from "./seo";

type JsonRecord = Record<string, unknown>;

describe("SEO public route metadata", () => {
  it("keeps every public route described for sitemap and AI retrieval", () => {
    const paths = publicPageProfiles.map((profile) => profile.path);

    expect(paths).toContain("/");
    expect(paths).toContain("/share");
    expect(paths).toContain("/karma-yoga");
    expect(new Set(paths).size).toBe(paths.length);
    expect(publicShareDestinations.map((item) => item.href)).toEqual(
      expect.arrayContaining(["/karma-yoga", "/bhakti-journal", "/dhyana-meditation"]),
    );

    for (const profile of publicPageProfiles) {
      expect(profile.title.length).toBeGreaterThanOrEqual(35);
      expect(profile.description.length).toBeGreaterThanOrEqual(120);
      expect(profile.description.length).toBeLessThanOrEqual(180);
      expect(profile.summary.length).toBeGreaterThan(80);
      expect(profile.lastModified).toBe(PUBLIC_CONTENT_LAST_MODIFIED);
      expect(profile.keywords.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("enriches page metadata with canonical, social, and route-specific keywords", () => {
    const metadata = buildPageMetadata({
      title: "Karma Yoga Tracker",
      description: "Track service reflections.",
      path: "/karma-yoga",
      keywords: ["daily seva"],
    });

    expect(metadata.alternates?.canonical).toContain("/karma-yoga");
    expect(metadata.openGraph?.url).toContain("/karma-yoga");
    expect(metadata.twitter?.card).toBe("summary_large_image");
    expect(metadata.keywords).toEqual(
      expect.arrayContaining(["karma yoga tracker", "service reflection app", "daily seva"]),
    );
  });

  it("publishes homepage FAQ and module ItemList structured data", () => {
    const jsonLd = buildHomePageJsonLd();
    const graph = jsonLd["@graph"] as JsonRecord[];

    const faqNode = graph.find((entry) => entry["@type"] === "FAQPage");
    const itemListNode = graph.find((entry) => entry["@type"] === "ItemList");
    const faqEntries = Array.isArray(faqNode?.mainEntity) ? faqNode.mainEntity : [];
    const itemListEntries = Array.isArray(itemListNode?.itemListElement)
      ? itemListNode.itemListElement
      : [];

    expect(faqEntries).toHaveLength(homepageFaq.length);
    expect(itemListEntries.length).toBeGreaterThanOrEqual(6);
  });

  it("publishes a share kit CollectionPage structured data node", () => {
    const jsonLd = buildSharePageJsonLd();
    const graph = (jsonLd?.["@graph"] ?? []) as JsonRecord[];

    expect(graph.some((entry) => entry["@type"] === "CollectionPage")).toBe(true);
  });

  it("keeps sitemap generated from the public page profile catalog", () => {
    const sitemapEntries = sitemap();
    const urls = sitemapEntries.map((entry) => new URL(entry.url).pathname);
    const profilePaths = publicPageProfiles.map((profile) => profile.path);

    expect(urls).toEqual(profilePaths);
    expect(sitemapEntries.map((entry) => entry.lastModified)).toEqual(
      publicPageProfiles.map((profile) => profile.lastModified),
    );
    expect(urls).toContain("/share");
    expect(urls).not.toContain("/settings");
    expect(urls).not.toContain("/admin");
  });

  it("keeps private and API routes out of crawler access", () => {
    const robotRules = Array.isArray(robots().rules) ? robots().rules : [robots().rules];
    const bingbotRule = robotRules.find((rule) => rule.userAgent === "Bingbot");
    const wildcardRule = robotRules.find((rule) => rule.userAgent === "*");
    const rules = bingbotRule ?? wildcardRule;
    expect(bingbotRule).toBeTruthy();
    expect(wildcardRule).toBeTruthy();

    const disallow = Array.isArray(rules.disallow) ? rules.disallow : [rules.disallow];
    const allow = Array.isArray(rules.allow) ? rules.allow : [rules.allow];

    expect(disallow).toEqual(
      expect.arrayContaining(["/api/", "/admin/", "/admin", "/admin-access", "/settings", "/sign-in"]),
    );
    expect(allow).toEqual(expect.arrayContaining(["/", "/llms.txt", "/llms-full.txt"]));
    expect(robots().sitemap).toContain("/sitemap.xml");
  });
});
