import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  authMock,
  getCommunityConfigMock,
} = vi.hoisted(() => ({
  authMock: vi.fn(),
  getCommunityConfigMock: vi.fn(),
}));

vi.mock("@/auth", () => ({
  auth: authMock,
}));

vi.mock("@/app/lib/community-config", () => ({
  getCommunityConfig: getCommunityConfigMock,
}));

import { GET } from "./route";

function makeRequest(url: string) {
  return {
    nextUrl: new URL(url),
  } as never;
}

function mockSsoConfig() {
  getCommunityConfigMock.mockReturnValue({
    enabled: true,
    provider: "discourse",
    discourse: {
      enabled: true,
      ssoSecret: "secret",
    },
  });
}

describe("/api/community/discourse/login route", () => {
  beforeEach(() => {
    authMock.mockReset();
    getCommunityConfigMock.mockReset();
  });

  it("starts DiscourseConnect when a Buddhi user is signed in", async () => {
    mockSsoConfig();
    authMock.mockResolvedValue({
      user: {
        id: "google:123",
        email: "user@example.org",
      },
    });

    const res = await GET(
      makeRequest("https://buddhi-align.foreverlotus.com/api/community/discourse/login?returnPath=/community/c/buddhi-align/bhakti-journal"),
    );

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(
      "https://buddhi-align.foreverlotus.com/community/session/sso?return_path=%2Fcommunity%2Fc%2Fbuddhi-align%2Fbhakti-journal",
    );
  });

  it("falls back to public community browsing when no Buddhi user is signed in", async () => {
    mockSsoConfig();
    authMock.mockResolvedValue(null);

    const res = await GET(
      makeRequest("https://buddhi-align.foreverlotus.com/api/community/discourse/login?returnPath=/community/c/buddhi-align/karma-yoga"),
    );

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(
      "https://buddhi-align.foreverlotus.com/community/c/buddhi-align/karma-yoga",
    );
  });

  it("sanitizes return paths before redirecting", async () => {
    mockSsoConfig();
    authMock.mockResolvedValue({
      user: {
        id: "google:123",
        email: "user@example.org",
      },
    });

    const res = await GET(
      makeRequest("https://buddhi-align.foreverlotus.com/api/community/discourse/login?returnPath=https%3A%2F%2Fevil.example%2Fcommunity"),
    );

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(
      "https://buddhi-align.foreverlotus.com/community/session/sso?return_path=%2Fcommunity",
    );
  });

  it("falls back to the requested community path when SSO is not configured", async () => {
    getCommunityConfigMock.mockReturnValue({
      enabled: true,
      provider: "discourse",
      discourse: {
        enabled: true,
      },
    });

    const res = await GET(
      makeRequest("https://buddhi-align.foreverlotus.com/api/community/discourse/login?returnPath=/community/c/buddhi-align/dhyana-meditation"),
    );

    expect(authMock).not.toHaveBeenCalled();
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(
      "https://buddhi-align.foreverlotus.com/community/c/buddhi-align/dhyana-meditation",
    );
  });
});
