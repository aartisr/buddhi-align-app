import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getCommunityCategoryData,
  getCommunityOverviewData,
  getCommunityTopicData,
  plainTextFromDiscourseHtml,
} from "./discourse-api";
import type { CommunityConfig } from "../community-config";

const discourseConfig = {
  enabled: true,
  provider: "discourse",
  discourse: {
    enabled: true,
    baseUrl: "https://community.example.org",
    communityUrl: "https://buddhi-align.example.org/community",
    parentCategorySlug: "buddhi-align",
    requestTimeoutMs: 4000,
    ssoDefaultGroups: [],
    ssoAdminGroups: [],
    ssoModeratorGroups: [],
    ssoAllowedGroups: [],
    ssoDeniedGroups: [],
    ssoGrantAdminFromAppAdmin: false,
    ssoGrantModeratorFromAppAdmin: false,
    ssoGroupSyncMode: "add",
  },
} satisfies CommunityConfig;

function jsonResponse(payload: unknown) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("discourse-api community data", () => {
  it("maps Discourse subcategories into native community cards", async () => {
    const fetchMock = vi.fn(async () => jsonResponse({
      category_list: {
        categories: [
          { id: 10, name: "Buddhi Align", slug: "buddhi-align", subcategory_ids: [11] },
          {
            id: 11,
            name: "Karma Yoga",
            slug: "karma-yoga",
            description_text: "Service and seva discussion.",
            topic_count: 3,
            post_count: 8,
            parent_category_id: 10,
            color: "2f5d50",
          },
        ],
      },
    }));
    vi.stubGlobal("fetch", fetchMock);

    const data = await getCommunityOverviewData(discourseConfig);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://community.example.org/categories.json",
      expect.any(Object),
    );
    expect(data.status).toBe("ready");
    expect(data.categories).toMatchObject([
      {
        slug: "karma-yoga",
        name: "Karma Yoga",
        href: "/community/c/buddhi-align/karma-yoga",
        topicCount: 3,
        postCount: 8,
        color: "#2f5d50",
      },
    ]);
  });

  it("loads category topics by Discourse category id", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("/categories.json")) {
        return jsonResponse({
          category_list: {
            categories: [
              { id: 10, name: "Buddhi Align", slug: "buddhi-align", subcategory_ids: [11] },
              { id: 11, name: "Dhyana", slug: "dhyana-meditation", parent_category_id: 10 },
            ],
          },
        });
      }

      return jsonResponse({
        topic_list: {
          topics: [
            {
              id: 44,
              title: "Settling into practice",
              slug: "settling-into-practice",
              excerpt: "<p>How do you begin?</p>",
              posts_count: 2,
              views: 17,
              like_count: 4,
            },
          ],
        },
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const data = await getCommunityCategoryData(["buddhi-align", "dhyana-meditation"], discourseConfig);

    expect(fetchMock).toHaveBeenLastCalledWith(
      "https://community.example.org/c/buddhi-align/dhyana-meditation/11.json",
      expect.any(Object),
    );
    expect(data?.topics).toMatchObject([
      {
        id: 44,
        slug: "settling-into-practice",
        title: "Settling into practice",
        excerpt: "How do you begin?",
        href: "/community/t/settling-into-practice/44",
      },
    ]);
  });

  it("loads topic excerpts without rendering Discourse HTML", async () => {
    const fetchMock = vi.fn(async () => jsonResponse({
      id: 44,
      title: "Settling &amp; Stillness",
      slug: "settling-stillness",
      posts_count: 2,
      post_stream: {
        posts: [
          {
            id: 101,
            username: "aarti",
            name: "Aarti",
            post_number: 1,
            cooked: "<p>Begin with <strong>three breaths</strong>.</p>",
          },
        ],
      },
    }));
    vi.stubGlobal("fetch", fetchMock);

    const data = await getCommunityTopicData("settling-stillness", "44", discourseConfig);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://community.example.org/t/44.json",
      expect.any(Object),
    );
    expect(data?.topic.title).toBe("Settling & Stillness");
    expect(data?.topic.posts[0].excerpt).toBe("Begin with three breaths.");
  });

  it("strips scripts and decodes common HTML entities", () => {
    expect(
      plainTextFromDiscourseHtml("<script>alert(1)</script><p>Serve &amp; reflect&nbsp;daily.</p>"),
    ).toBe("Serve & reflect daily.");
  });
});
