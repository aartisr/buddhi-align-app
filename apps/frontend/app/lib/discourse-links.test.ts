import { describe, expect, it } from "vitest";
import { buildCommunityUrl, buildDiscourseCommunityUrl } from "./community-links";

describe("community-links", () => {
  it("builds module-aware native community category URLs", () => {
    const url = buildDiscourseCommunityUrl("karma", {
      enabled: true,
      provider: "discourse",
      discourse: {
        enabled: true,
        baseUrl: "https://community.example.org",
        communityUrl: undefined,
        defaultCategorySlug: undefined,
        requestTimeoutMs: 4000,
      },
    });

    expect(url).toBe("/community/c/karma-yoga");
  });

  it("returns undefined when integration is disabled", () => {
    const url = buildCommunityUrl("jnana", {
      enabled: false,
      provider: "none",
    });

    expect(url).toBeUndefined();
  });

  it("uses provider adapter for discourse", () => {
    const url = buildCommunityUrl("dhyana", {
      enabled: true,
      provider: "discourse",
      discourse: {
        enabled: true,
        baseUrl: "https://community.example.org",
        requestTimeoutMs: 4000,
      },
    });

    expect(url).toBe("/community/c/dhyana-meditation");
  });

  it("builds parent/subcategory URLs when parent category slug is configured", () => {
    const url = buildCommunityUrl("dhyana", {
      enabled: true,
      provider: "discourse",
      discourse: {
        enabled: true,
        baseUrl: "https://community.example.org",
        parentCategorySlug: "buddhi-align",
        requestTimeoutMs: 4000,
      },
    });

    expect(url).toBe("/community/c/buddhi-align/dhyana-meditation");
  });

  it("keeps module links relative even when an absolute app community URL is configured", () => {
    const url = buildCommunityUrl("bhakti", {
      enabled: true,
      provider: "discourse",
      discourse: {
        enabled: true,
        baseUrl: "https://community.example.org",
        communityUrl: "https://buddhi-align.example.org/community",
        parentCategorySlug: "buddhi-align",
        requestTimeoutMs: 4000,
      },
    });

    expect(url).toBe("/community/c/buddhi-align/bhakti-journal");
  });

  it("does not send module community links to the external Discourse origin", () => {
    const url = buildCommunityUrl("bhakti", {
      enabled: true,
      provider: "discourse",
      discourse: {
        enabled: true,
        baseUrl: "https://community.example.org",
        communityUrl: "https://community.example.org",
        parentCategorySlug: "buddhi-align",
        requestTimeoutMs: 4000,
      },
    });

    expect(url).toBe("/community/c/buddhi-align/bhakti-journal");
  });
});
