import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getCommunityConfigMock,
  validateCommunityConfigMock,
  buildCommunityUrlMock,
  resolveDiscourseModuleCategoryLinkMock,
} = vi.hoisted(() => ({
  getCommunityConfigMock: vi.fn(),
  validateCommunityConfigMock: vi.fn(),
  buildCommunityUrlMock: vi.fn(),
  resolveDiscourseModuleCategoryLinkMock: vi.fn(),
}));

vi.mock("@/app/lib/community-config", () => ({
  getCommunityConfig: getCommunityConfigMock,
  validateCommunityConfig: validateCommunityConfigMock,
}));

vi.mock("@/app/lib/community-links", () => ({
  isCommunityModuleKey: (value: string | null | undefined) =>
    ["karma", "bhakti", "jnana", "dhyana", "vasana", "dharma", "motivation"].includes(value ?? ""),
  buildCommunityUrl: buildCommunityUrlMock,
}));

vi.mock("@/app/lib/community/discourse-category-links", () => ({
  resolveDiscourseModuleCategoryLink: resolveDiscourseModuleCategoryLinkMock,
}));

import { GET } from "./route";

function makeRequest(url: string) {
  return {
    nextUrl: new URL(url),
  } as never;
}

describe("/api/community/link route", () => {
  beforeEach(() => {
    getCommunityConfigMock.mockReset();
    validateCommunityConfigMock.mockReset();
    buildCommunityUrlMock.mockReset();
    resolveDiscourseModuleCategoryLinkMock.mockReset();
  });

  it("returns 400 for invalid module query", async () => {
    const res = await GET(makeRequest("https://example.org/api/community/link?module=unknown"));
    const payload = await res.json();

    expect(res.status).toBe(400);
    expect(payload.error).toBe("Invalid or missing module query parameter.");
  });

  it("returns disabled when config validation fails", async () => {
    getCommunityConfigMock.mockReturnValue({ enabled: true, provider: "discourse" });
    validateCommunityConfigMock.mockReturnValue({ ok: false, errors: ["bad"], warnings: [] });

    const res = await GET(makeRequest("https://example.org/api/community/link?module=karma"));
    const payload = await res.json();

    expect(res.status).toBe(200);
    expect(payload.enabled).toBe(false);
    expect(payload.reason).toBe("invalid_config");
  });

  it("returns resolved community link when available", async () => {
    getCommunityConfigMock.mockReturnValue({ enabled: true, provider: "discourse" });
    validateCommunityConfigMock.mockReturnValue({ ok: true, errors: [], warnings: [] });
    buildCommunityUrlMock.mockReturnValue("/community/c/karma-yoga");
    resolveDiscourseModuleCategoryLinkMock.mockResolvedValue({
      moduleKey: "karma",
      href: "/community/c/buddhi-align/karma-yoga/12",
      categoryId: 12,
    });

    const res = await GET(makeRequest("https://example.org/api/community/link?module=karma"));
    const payload = await res.json();

    expect(res.status).toBe(200);
    expect(payload.enabled).toBe(true);
    expect(payload.provider).toBe("discourse");
    expect(payload.url).toBe("/community/c/buddhi-align/karma-yoga/12");
    expect(payload.categoryId).toBe(12);
    expect(buildCommunityUrlMock).not.toHaveBeenCalled();
    expect(res.headers.get("Cache-Control")).toContain("s-maxage=300");
  });
});
