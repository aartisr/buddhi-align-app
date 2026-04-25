import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import robots from "../robots";
import sitemap from "../sitemap";
import {
  homepageFaq,
  PUBLIC_CONTENT_LAST_MODIFIED,
  publicPageProfiles,
  publicShareDestinations,
} from "./public-content";
import {
  buildHomePageJsonLd,
  buildAutographProfileDescription,
  buildAutographProfilePageJsonLd,
  buildAutographProfilesDirectoryJsonLd,
  buildNoIndexMetadata,
  buildPageMetadata,
  buildSharePageJsonLd,
} from "./seo";

type JsonRecord = Record<string, unknown>;

describe("SEO public route metadata", () => {
  const llmsTxt = readFileSync(resolve(__dirname, "../../public/llms.txt"), "utf8");
  const llmsFullTxt = readFileSync(resolve(__dirname, "../../public/llms-full.txt"), "utf8");

  it("keeps every public route described for sitemap and AI retrieval", () => {
    const paths = publicPageProfiles.map((profile) => profile.path);

    expect(paths).toContain("/");
    expect(paths).toContain("/share");
    expect(paths).toContain("/karma-yoga");
    expect(paths).toContain("/community");
    expect(paths).toContain("/profiles");
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
    expect(metadata.twitter?.images).toEqual(
      expect.arrayContaining([expect.objectContaining({ alt: expect.stringContaining("Karma Yoga") })]),
    );
    expect(metadata.other?.bingbot).toContain("max-image-preview:large");
    expect(metadata.keywords).toEqual(
      expect.arrayContaining(["karma yoga tracker", "service reflection app", "daily seva"]),
    );
  });

  it("marks protected app surfaces as noindex for major crawlers", () => {
    const metadata = buildNoIndexMetadata({
      title: "Buddhi Align Private Settings and Preferences",
      description:
        "Review private Buddhi Align settings for profile preferences, account details, notification choices, and personalized practice configuration after signing in.",
      path: "/settings",
    });

    expect(metadata.robots).toMatchObject({
      index: false,
      follow: false,
    });
    expect(metadata.other?.bingbot).toBe("noindex, nofollow");
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

  it("publishes profile directory and profile page structured data", () => {
    const profile = {
      id: "teacher-1",
      displayName: "Asha Raman",
      role: "teacher",
      headline: "Guiding mindful creative writing circles",
      bio: "Asha helps students shape meaningful keepsakes through reflective writing, gratitude practices, and community storytelling.",
      avatarUrl: "/api/autographs/profiles/teacher-1/avatar",
      affiliation: "ForeverLotus Academy",
      location: "Seattle",
      subjects: ["creative writing", "mindfulness"],
      interests: ["gratitude"],
      updatedAt: "2026-04-24",
    };
    const description = buildAutographProfileDescription(profile);
    const directoryJsonLd = buildAutographProfilesDirectoryJsonLd([profile]);
    const profileJsonLd = buildAutographProfilePageJsonLd(profile);
    const directoryGraph = directoryJsonLd["@graph"] as JsonRecord[];
    const profileGraph = profileJsonLd["@graph"] as JsonRecord[];

    expect(description.length).toBeGreaterThanOrEqual(110);
    expect(description.length).toBeLessThanOrEqual(175);
    expect(directoryGraph.some((entry) => entry["@type"] === "CollectionPage")).toBe(true);
    expect(profileGraph.some((entry) => entry["@type"] === "ProfilePage")).toBe(true);
    expect(profileGraph.some((entry) => entry["@type"] === "Person")).toBe(true);
  });

  it("keeps sitemap generated from the public page profile catalog", async () => {
    const sitemapEntries = await sitemap();
    const urls = sitemapEntries.map((entry) => new URL(entry.url).pathname);
    const profilePaths = publicPageProfiles.map((profile) => profile.path);

    expect(urls).toEqual(expect.arrayContaining(profilePaths));
    expect(sitemapEntries.slice(0, publicPageProfiles.length).map((entry) => entry.lastModified)).toEqual(
      publicPageProfiles.map((profile) => profile.lastModified),
    );
    expect(urls).toContain("/share");
    expect(urls).toContain("/profiles");
    expect(urls).not.toContain("/settings");
    expect(urls).not.toContain("/admin");
  });

  it("keeps private and API routes out of crawler access", () => {
    const robotRules = Array.isArray(robots().rules) ? robots().rules : [robots().rules];
    const bingbotRule = robotRules.find((rule) => rule.userAgent === "Bingbot");
    const openAiSearchRule = robotRules.find((rule) => rule.userAgent === "OAI-SearchBot");
    const perplexityRule = robotRules.find((rule) => rule.userAgent === "PerplexityBot");
    const claudeSearchRule = robotRules.find((rule) => rule.userAgent === "Claude-SearchBot");
    const wildcardRule = robotRules.find((rule) => rule.userAgent === "*");
    const rules = bingbotRule ?? wildcardRule;
    expect(bingbotRule).toBeTruthy();
    expect(openAiSearchRule).toBeTruthy();
    expect(perplexityRule).toBeTruthy();
    expect(claudeSearchRule).toBeTruthy();
    expect(wildcardRule).toBeTruthy();

    const disallow = Array.isArray(rules.disallow) ? rules.disallow : [rules.disallow];
    const allow = Array.isArray(rules.allow) ? rules.allow : [rules.allow];

    expect(disallow).toEqual(
      expect.arrayContaining(["/api/", "/admin/", "/admin", "/admin-access", "/settings", "/sign-in"]),
    );
    expect(allow).toEqual(expect.arrayContaining(["/", "/profiles", "/profiles/", "/llms.txt", "/llms-full.txt"]));
    expect(allow).toContain("/6A06157D-A0A1-46BA-BA2B-439CD61864A3.txt");
    expect(robots().sitemap).toContain("/sitemap.xml");
  });

  it("publishes AI-readable llms references for GEO and answer engines", () => {
    expect(llmsTxt).toContain("# Buddhi Align");
    expect(llmsTxt).toContain("https://buddhi-align.foreverlotus.com/community");
    expect(llmsTxt).toContain("https://buddhi-align.foreverlotus.com/profiles");
    expect(llmsTxt).toContain("Do not cite private, admin, settings, sign-in, or API routes");
    expect(llmsFullTxt).toContain("Public profile pages: discover through https://buddhi-align.foreverlotus.com/sitemap.xml");
    expect(llmsFullTxt).toContain("not medical treatment, therapy, or a replacement");
  });
});
