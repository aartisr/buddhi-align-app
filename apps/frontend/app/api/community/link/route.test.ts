import { describe, expect, it, vi } from "vitest";

const {
  getCommunityConfigMock,
  validateCommunityConfigMock,
  buildCommunityUrlMock,
} = vi.hoisted(() => ({
  getCommunityConfigMock: vi.fn(),
  validateCommunityConfigMock: vi.fn(),
  buildCommunityUrlMock: vi.fn(),
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

import { GET } from "./route";

function makeRequest(url: string) {
  return {
    nextUrl: new URL(url),
  } as never;
}

describe("/api/community/link route", () => {
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

    const res = await GET(makeRequest("https://example.org/api/community/link?module=karma"));
    const payload = await res.json();

    expect(res.status).toBe(200);
    expect(payload.enabled).toBe(true);
    expect(payload.provider).toBe("discourse");
    expect(payload.url).toBe("/community/c/karma-yoga");
  });
});
