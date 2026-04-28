import { afterEach, describe, expect, it, vi } from "vitest";
import type { CommunityConfig } from "../community-config";
import {
  buildCommunityCategoryHref,
  resolveDiscourseModuleCategoryLink,
  resolveDiscourseModuleCategoryLinks,
} from "./discourse-category-links";

const discourseConfig = {
  enabled: true,
  provider: "discourse",
  discourse: {
    enabled: true,
    baseUrl: "https://community.example.org/community",
    communityUrl: "https://buddhi-align.example.org/community",
    parentCategorySlug: "buddhi-align",
    apiUsername: "system",
    apiKey: "secret",
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

describe("discourse category links", () => {
  it("builds Discourse category hrefs with optional parent and id segments", () => {
    expect(buildCommunityCategoryHref("bhakti-journal", "buddhi-align", 11)).toBe(
      "/community/c/buddhi-align/bhakti-journal/11",
    );
    expect(buildCommunityCategoryHref("buddhi-align", "buddhi-align", 10)).toBe(
      "/community/c/buddhi-align/10",
    );
  });

  it("resolves module links to ID-qualified Discourse subcategory URLs", async () => {
    const fetchMock = vi.fn(async () => jsonResponse({
      category_list: {
        categories: [
          { id: 10, name: "Buddhi Align", slug: "buddhi-align", subcategory_ids: [11] },
          { id: 11, name: "Bhakti Journal", slug: "bhakti-journal", parent_category_id: 10 },
        ],
      },
    }));
    vi.stubGlobal("fetch", fetchMock);

    const link = await resolveDiscourseModuleCategoryLink("bhakti", discourseConfig);

    expect(link).toEqual({
      moduleKey: "bhakti",
      href: "/community/c/buddhi-align/bhakti-journal/11",
      categoryId: 11,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://community.example.org/community/categories.json",
      expect.objectContaining({ headers: expect.any(Headers) }),
    );
    const headers = fetchMock.mock.calls[0]?.[1]?.headers as Headers;
    expect(headers.get("Api-Username")).toBe("system");
    expect(headers.get("Api-Key")).toBe("secret");
  });

  it("falls back to the community root when active Discourse category IDs are unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("unavailable", { status: 503 })));

    const link = await resolveDiscourseModuleCategoryLink("karma", discourseConfig);

    expect(link).toEqual({
      moduleKey: "karma",
      href: "/community",
      categoryId: undefined,
    });
  });

  it("keeps sitemap category routes under the Buddhi Align parent by default", async () => {
    const links = await resolveDiscourseModuleCategoryLinks({
      enabled: false,
      provider: "none",
    });

    expect(links.map((link) => link.href)).toEqual(
      expect.arrayContaining([
        "/community/c/buddhi-align/bhakti-journal",
        "/community/c/buddhi-align/karma-yoga",
        "/community/c/buddhi-align/dhyana-meditation",
      ]),
    );
  });

  it("omits active Discourse sitemap category routes that cannot be ID-qualified", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("unavailable", { status: 503 })));

    const links = await resolveDiscourseModuleCategoryLinks(discourseConfig);

    expect(links).toEqual([]);
  });
});
