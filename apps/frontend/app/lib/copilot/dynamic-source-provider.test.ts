import { describe, expect, it } from "vitest";

import {
  autographProfileToCopilotDocument,
  communityCategoryToCopilotDocument,
  DynamicCopilotSourceProvider,
  type DynamicSourceLoaders,
} from "./dynamic-source-provider";

const communityLoaders: DynamicSourceLoaders = {
  async getCommunityOverviewData() {
    return {
      status: "ready",
      warnings: [],
      categories: [
        {
          id: 12,
          slug: "bhakti-journal",
          name: "Bhakti Journal",
          description: "Devotion, gratitude, and heartfelt practice discussions.",
          href: "/community/c/bhakti-journal",
          topicCount: 2,
          postCount: 8,
          icon: "flower",
          moduleKey: "bhakti",
        },
      ],
    };
  },
  async getCommunityCategoryData() {
    return {
      status: "ready",
      warnings: [],
      category: {
        id: 12,
        slug: "bhakti-journal",
        name: "Bhakti Journal",
        description: "Devotion, gratitude, and heartfelt practice discussions.",
        href: "/community/c/bhakti-journal",
        icon: "flower",
        moduleKey: "bhakti",
      },
      subcategories: [],
      topics: [
        {
          id: 99,
          slug: "daily-gratitude",
          title: "Daily gratitude reflections",
          excerpt: "A community topic about devotional gratitude practice.",
          href: "/community/t/daily-gratitude/99",
          postsCount: 4,
        },
      ],
    };
  },
  async listPublicAutographProfiles() {
    return [];
  },
};

describe("dynamic copilot source mappings", () => {
  it("maps community categories to public copilot documents", () => {
    const document = communityCategoryToCopilotDocument({
      slug: "karma-yoga",
      name: "Karma Yoga",
      description: "Service discussion",
      href: "/community/c/karma-yoga",
      icon: "hands",
      moduleKey: "karma",
    });

    expect(document).toMatchObject({
      sourceType: "community_category",
      title: "Karma Yoga Community",
      url: "/community/c/karma-yoga",
      moduleKey: "karma",
      visibility: "public",
    });
  });

  it("maps public autograph profiles to public copilot documents", () => {
    const document = autographProfileToCopilotDocument({
      id: "teacher-1",
      displayName: "Aarti Teacher",
      role: "teacher",
      headline: "Language and reflection guide",
      bio: "Helps students preserve thoughtful school memories.",
      subjects: ["Sanskrit"],
      interests: ["gratitude"],
      updatedAt: "2026-05-01T00:00:00.000Z",
    });

    expect(document).toMatchObject({
      sourceType: "autograph_profile",
      title: "Aarti Teacher Autograph Profile",
      url: "/profiles/teacher-1",
      moduleKey: "autograph",
      visibility: "public",
    });
    expect(document.text).toContain("Sanskrit");
  });
});

describe("DynamicCopilotSourceProvider", () => {
  it("retrieves live community topic documents through the loader seam", async () => {
    const provider = new DynamicCopilotSourceProvider(communityLoaders, 1000);

    const results = await provider.search({
      query: "gratitude community topic",
      sourceTypes: ["community_topic"],
      limit: 3,
    });

    expect(results).toEqual([
      expect.objectContaining({
        sourceType: "community_topic",
        title: "Daily gratitude reflections",
        url: "/community/t/daily-gratitude/99",
      }),
    ]);
  });

  it("times out slow dynamic sources and returns an empty result", async () => {
    const provider = new DynamicCopilotSourceProvider({
      getCommunityOverviewData: () => new Promise(() => undefined),
      getCommunityCategoryData: async () => null,
      listPublicAutographProfiles: async () => [],
    }, 1);

    await expect(provider.search({
      query: "community",
      sourceTypes: ["community_category"],
      limit: 3,
    })).resolves.toEqual([]);
  });
});
