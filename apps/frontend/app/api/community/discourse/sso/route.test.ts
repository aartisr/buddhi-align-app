import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  authMock,
  cookiesMock,
  isAdminCookieValidMock,
  recordObservabilityEventMock,
  getCommunityConfigMock,
  validateCommunityConfigMock,
  isValidDiscourseSsoSignatureMock,
  parseDiscourseSsoRequestMock,
  buildDiscourseSsoRedirectUrlMock,
} = vi.hoisted(() => ({
  authMock: vi.fn(),
  cookiesMock: vi.fn(),
  isAdminCookieValidMock: vi.fn(),
  recordObservabilityEventMock: vi.fn(),
  getCommunityConfigMock: vi.fn(),
  validateCommunityConfigMock: vi.fn(),
  isValidDiscourseSsoSignatureMock: vi.fn(),
  parseDiscourseSsoRequestMock: vi.fn(),
  buildDiscourseSsoRedirectUrlMock: vi.fn(),
}));

vi.mock("@/auth", () => ({
  auth: authMock,
}));

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

vi.mock("@/app/auth/admin", () => ({
  ADMIN_COOKIE_NAME: "buddhi-align-admin",
  isAdminCookieValid: isAdminCookieValidMock,
}));

vi.mock("@/app/lib/server-observability", () => ({
  recordObservabilityEvent: recordObservabilityEventMock,
}));

vi.mock("@/app/lib/community-config", () => ({
  getCommunityConfig: getCommunityConfigMock,
  validateCommunityConfig: validateCommunityConfigMock,
}));

vi.mock("@/app/lib/discourse-sso", () => ({
  isValidDiscourseSsoSignature: isValidDiscourseSsoSignatureMock,
  parseDiscourseSsoRequest: parseDiscourseSsoRequestMock,
  buildDiscourseSsoRedirectUrl: buildDiscourseSsoRedirectUrlMock,
}));

import { GET } from "./route";

function makeRequest(url: string) {
  return {
    nextUrl: new URL(url),
  } as never;
}

describe("/api/community/discourse/sso route", () => {
  beforeEach(() => {
    cookiesMock.mockReturnValue({ get: vi.fn().mockReturnValue(undefined) });
    isAdminCookieValidMock.mockReturnValue(false);
    recordObservabilityEventMock.mockReset();
  });

  it("returns 400 when sso params are missing", async () => {
    const res = await GET(makeRequest("https://app.example.org/api/community/discourse/sso"));
    const payload = await res.json();

    expect(res.status).toBe(400);
    expect(payload.error).toContain("Missing required sso and sig");
  });

  it("returns 403 when signature is invalid", async () => {
    getCommunityConfigMock.mockReturnValue({
      enabled: true,
      provider: "discourse",
      discourse: { ssoSecret: "secret", enabled: true },
    });
    validateCommunityConfigMock.mockReturnValue({ ok: true, errors: [], warnings: [] });
    isValidDiscourseSsoSignatureMock.mockReturnValue(false);

    const res = await GET(makeRequest("https://app.example.org/api/community/discourse/sso?sso=abc&sig=def"));
    const payload = await res.json();

    expect(res.status).toBe(403);
    expect(payload.error).toContain("Invalid SSO signature");
  });

  it("redirects unauthenticated users to sign-in with callback", async () => {
    getCommunityConfigMock.mockReturnValue({
      enabled: true,
      provider: "discourse",
      discourse: { ssoSecret: "secret", enabled: true },
    });
    validateCommunityConfigMock.mockReturnValue({ ok: true, errors: [], warnings: [] });
    isValidDiscourseSsoSignatureMock.mockReturnValue(true);
    parseDiscourseSsoRequestMock.mockReturnValue({
      nonce: "abc",
      returnSsoUrl: "https://community.example.org/session/sso_login",
    });
    authMock.mockResolvedValue(null);

    const res = await GET(makeRequest("https://app.example.org/api/community/discourse/sso?sso=abc&sig=def"));

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/sign-in?");
    expect(res.headers.get("location")).toContain("callbackUrl=%2Fapi%2Fcommunity%2Fdiscourse%2Fsso%3Fsso%3Dabc%26sig%3Ddef");
  });

  it("redirects to discourse return URL when request is valid", async () => {
    getCommunityConfigMock.mockReturnValue({
      enabled: true,
      provider: "discourse",
      discourse: {
        ssoSecret: "secret",
        enabled: true,
        ssoGroupSyncMode: "add",
        ssoDefaultGroups: ["community-members"],
        ssoAdminGroups: ["core-admins"],
        ssoModeratorGroups: ["practice-guides"],
        ssoAllowedGroups: [],
        ssoDeniedGroups: [],
        ssoGrantAdminFromAppAdmin: true,
        ssoGrantModeratorFromAppAdmin: true,
      },
    });
    validateCommunityConfigMock.mockReturnValue({ ok: true, errors: [], warnings: [] });
    isValidDiscourseSsoSignatureMock.mockReturnValue(true);
    parseDiscourseSsoRequestMock.mockReturnValue({
      nonce: "abc",
      returnSsoUrl: "https://community.example.org/session/sso_login",
    });
    authMock.mockResolvedValue({
      user: {
        id: "user-1",
        email: "user@example.org",
        name: "User One",
      },
    });
    buildDiscourseSsoRedirectUrlMock.mockReturnValue(
      "https://community.example.org/session/sso_login?sso=payload&sig=signed",
    );

    const res = await GET(makeRequest("https://app.example.org/api/community/discourse/sso?sso=abc&sig=def"));

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(
      "https://community.example.org/session/sso_login?sso=payload&sig=signed",
    );

    expect(buildDiscourseSsoRedirectUrlMock).toHaveBeenCalledWith(
      {
        nonce: "abc",
        returnSsoUrl: "https://community.example.org/session/sso_login",
      },
      {
        externalId: "user-1",
        email: "user@example.org",
        username: "User One",
        name: "User One",
        admin: false,
        moderator: false,
        groups: undefined,
        addGroups: ["community-members"],
      },
      "secret",
    );

    expect(recordObservabilityEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "community_discourse_sso_role_group_mapping_applied",
        source: "server",
        userId: "user-1",
      }),
    );
  });

  it("maps app-admin users to discourse privileged roles and groups", async () => {
    getCommunityConfigMock.mockReturnValue({
      enabled: true,
      provider: "discourse",
      discourse: {
        ssoSecret: "secret",
        enabled: true,
        ssoGroupSyncMode: "add",
        ssoDefaultGroups: ["community-members"],
        ssoAdminGroups: ["core-admins"],
        ssoModeratorGroups: ["practice-guides"],
        ssoAllowedGroups: [],
        ssoDeniedGroups: [],
        ssoGrantAdminFromAppAdmin: true,
        ssoGrantModeratorFromAppAdmin: true,
      },
    });
    validateCommunityConfigMock.mockReturnValue({ ok: true, errors: [], warnings: [] });
    isValidDiscourseSsoSignatureMock.mockReturnValue(true);
    parseDiscourseSsoRequestMock.mockReturnValue({
      nonce: "abc",
      returnSsoUrl: "https://community.example.org/session/sso_login",
    });
    authMock.mockResolvedValue({
      user: {
        id: "user-1",
        email: "user@example.org",
        name: "User One",
      },
    });
    cookiesMock.mockReturnValue({ get: vi.fn().mockReturnValue({ value: "admin-cookie" }) });
    isAdminCookieValidMock.mockReturnValue(true);
    buildDiscourseSsoRedirectUrlMock.mockReturnValue(
      "https://community.example.org/session/sso_login?sso=payload&sig=signed",
    );

    const res = await GET(makeRequest("https://app.example.org/api/community/discourse/sso?sso=abc&sig=def"));

    expect(res.status).toBe(307);
    expect(buildDiscourseSsoRedirectUrlMock).toHaveBeenCalledWith(
      {
        nonce: "abc",
        returnSsoUrl: "https://community.example.org/session/sso_login",
      },
      {
        externalId: "user-1",
        email: "user@example.org",
        username: "User One",
        name: "User One",
        admin: true,
        moderator: true,
        groups: undefined,
        addGroups: ["community-members", "core-admins", "practice-guides"],
      },
      "secret",
    );
  });

  it("uses groups field in strict sync mode", async () => {
    getCommunityConfigMock.mockReturnValue({
      enabled: true,
      provider: "discourse",
      discourse: {
        ssoSecret: "secret",
        enabled: true,
        ssoGroupSyncMode: "sync",
        ssoDefaultGroups: ["community-members"],
        ssoAdminGroups: ["core-admins"],
        ssoModeratorGroups: ["practice-guides"],
        ssoAllowedGroups: [],
        ssoDeniedGroups: [],
        ssoGrantAdminFromAppAdmin: false,
        ssoGrantModeratorFromAppAdmin: false,
      },
    });
    validateCommunityConfigMock.mockReturnValue({ ok: true, errors: [], warnings: [] });
    isValidDiscourseSsoSignatureMock.mockReturnValue(true);
    parseDiscourseSsoRequestMock.mockReturnValue({
      nonce: "abc",
      returnSsoUrl: "https://community.example.org/session/sso_login",
    });
    authMock.mockResolvedValue({
      user: {
        id: "user-1",
        email: "user@example.org",
        name: "User One",
      },
    });
    buildDiscourseSsoRedirectUrlMock.mockReturnValue(
      "https://community.example.org/session/sso_login?sso=payload&sig=signed",
    );

    const res = await GET(makeRequest("https://app.example.org/api/community/discourse/sso?sso=abc&sig=def"));

    expect(res.status).toBe(307);
    expect(buildDiscourseSsoRedirectUrlMock).toHaveBeenCalledWith(
      {
        nonce: "abc",
        returnSsoUrl: "https://community.example.org/session/sso_login",
      },
      {
        externalId: "user-1",
        email: "user@example.org",
        username: "User One",
        name: "User One",
        admin: false,
        moderator: false,
        groups: ["community-members"],
        addGroups: undefined,
      },
      "secret",
    );
  });

  it("filters mapped groups using allowlist and denylist policy", async () => {
    getCommunityConfigMock.mockReturnValue({
      enabled: true,
      provider: "discourse",
      discourse: {
        ssoSecret: "secret",
        enabled: true,
        ssoGroupSyncMode: "add",
        ssoDefaultGroups: ["community-members", "seekers"],
        ssoAdminGroups: ["core-admins"],
        ssoModeratorGroups: ["practice-guides"],
        ssoAllowedGroups: ["community-members", "core-admins", "practice-guides"],
        ssoDeniedGroups: ["practice-guides"],
        ssoGrantAdminFromAppAdmin: true,
        ssoGrantModeratorFromAppAdmin: true,
      },
    });
    validateCommunityConfigMock.mockReturnValue({ ok: true, errors: [], warnings: [] });
    isValidDiscourseSsoSignatureMock.mockReturnValue(true);
    parseDiscourseSsoRequestMock.mockReturnValue({
      nonce: "abc",
      returnSsoUrl: "https://community.example.org/session/sso_login",
    });
    authMock.mockResolvedValue({
      user: {
        id: "user-1",
        email: "user@example.org",
        name: "User One",
      },
    });
    cookiesMock.mockReturnValue({ get: vi.fn().mockReturnValue({ value: "admin-cookie" }) });
    isAdminCookieValidMock.mockReturnValue(true);
    buildDiscourseSsoRedirectUrlMock.mockReturnValue(
      "https://community.example.org/session/sso_login?sso=payload&sig=signed",
    );

    const res = await GET(makeRequest("https://app.example.org/api/community/discourse/sso?sso=abc&sig=def"));

    expect(res.status).toBe(307);
    expect(buildDiscourseSsoRedirectUrlMock).toHaveBeenCalledWith(
      {
        nonce: "abc",
        returnSsoUrl: "https://community.example.org/session/sso_login",
      },
      {
        externalId: "user-1",
        email: "user@example.org",
        username: "User One",
        name: "User One",
        admin: true,
        moderator: true,
        groups: undefined,
        addGroups: ["community-members", "core-admins"],
      },
      "secret",
    );
  });
});
