import { describe, expect, it } from "vitest";
import { buildCommunityUrl, buildDiscourseCommunityUrl } from "./community-links";

describe("community-links", () => {
  it("builds module-aware discourse category URLs", () => {
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

    expect(url).toBe("https://community.example.org/c/karma-yoga");
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

    expect(url).toBe("https://community.example.org/c/dhyana-meditation");
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

    expect(url).toBe("https://community.example.org/c/buddhi-align/dhyana-meditation");
  });
});
