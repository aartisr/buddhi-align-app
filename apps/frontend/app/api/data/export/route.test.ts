import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  isAnonymousCookieMock,
  createDataProviderMock,
  listAnonymousEntriesMock,
  authMock,
  recordObservabilityEventMock,
} = vi.hoisted(() => ({
  isAnonymousCookieMock: vi.fn(),
  createDataProviderMock: vi.fn(),
  listAnonymousEntriesMock: vi.fn(),
  authMock: vi.fn(),
  recordObservabilityEventMock: vi.fn(),
}));

vi.mock("@/app/auth/anonymous", () => ({
  ANONYMOUS_COOKIE_NAME: "buddhi-align-anonymous",
  isAnonymousCookie: isAnonymousCookieMock,
}));

vi.mock("@buddhi-align/data-access", () => ({
  createDataProvider: createDataProviderMock,
}));

vi.mock("@/auth", () => ({
  auth: authMock,
}));

vi.mock("@/app/lib/server-observability", () => ({
  recordObservabilityEvent: recordObservabilityEventMock,
}));

vi.mock("../../_anonymous-module-store", () => ({
  listAnonymousEntries: listAnonymousEntriesMock,
}));

import { GET, POST } from "./route";

function makeRequest(body?: unknown) {
  return {
    cookies: {
      get: () => ({ value: "cookie-value" }),
    },
    json: async () => {
      if (body instanceof Error) throw body;
      return body;
    },
  } as never;
}

describe("/api/data/export route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.mockResolvedValue({
      user: {
        id: "user-1",
        provider: "google",
        authConfidence: "oidc",
        authAt: Date.now(),
      },
    });
  });

  it("GET returns archive payload with all modules", async () => {
    isAnonymousCookieMock.mockReturnValue(false);

    const list = vi.fn(async (module: string) => [{ id: `${module}-1`, date: "2026-01-01" }]);
    createDataProviderMock.mockReturnValue({
      list,
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    });

    const res = await GET(makeRequest());
    const payload = JSON.parse(await res.text());

    expect(res.status).toBe(200);
    expect(payload.version).toBe(1);
    expect(typeof payload.exportedAt).toBe("string");
    expect(Object.keys(payload.modules)).toContain("karma");
    expect(Object.keys(payload.modules)).toContain("dharma");
    expect(list).toHaveBeenCalledTimes(6);
    expect(res.headers.get("Content-Disposition")).toContain("buddhi-align-export-");
  });

  it("GET uses anonymous store when anonymous cookie is present", async () => {
    isAnonymousCookieMock.mockReturnValue(true);
    listAnonymousEntriesMock.mockImplementation((module: string) => [{ id: `${module}-anon` }]);

    const res = await GET(makeRequest());
    const payload = JSON.parse(await res.text());

    expect(res.status).toBe(200);
    expect(payload.modules.karma).toEqual([{ id: "karma-anon" }]);
    expect(payload.modules.bhakti).toEqual([{ id: "bhakti-anon" }]);
    expect(createDataProviderMock).not.toHaveBeenCalled();
  });

  it("POST blocks import in anonymous mode", async () => {
    isAnonymousCookieMock.mockReturnValue(true);

    const res = await POST(makeRequest({ modules: {} }));
    const payload = await res.json();

    expect(res.status).toBe(403);
    expect(payload.error).toContain("anonymous mode");
  });

  it("GET blocks export for non-OIDC sessions", async () => {
    isAnonymousCookieMock.mockReturnValue(false);
    authMock.mockResolvedValue({
      user: {
        id: "user-1",
        provider: "github",
        authConfidence: "oauth",
      },
    });

    const res = await GET(makeRequest());
    const payload = await res.json();

    expect(res.status).toBe(403);
    expect(payload.error).toContain("OIDC authentication required");
  });

  it("POST blocks import for non-OIDC sessions", async () => {
    isAnonymousCookieMock.mockReturnValue(false);
    authMock.mockResolvedValue({
      user: {
        id: "user-1",
        provider: "github",
        authConfidence: "oauth",
      },
    });

    const res = await POST(makeRequest({ modules: {} }));
    const payload = await res.json();

    expect(res.status).toBe(403);
    expect(payload.error).toContain("OIDC authentication required");
  });

  it("GET blocks export when re-authentication is stale", async () => {
    isAnonymousCookieMock.mockReturnValue(false);
    authMock.mockResolvedValue({
      user: {
        id: "user-1",
        provider: "google",
        authConfidence: "oidc",
        authAt: Date.now() - 1000 * 60 * 60,
      },
    });

    const res = await GET(makeRequest());
    const payload = await res.json();

    expect(res.status).toBe(403);
    expect(payload.error).toContain("re-authentication required");
  });

  it("POST blocks import when re-authentication is stale", async () => {
    isAnonymousCookieMock.mockReturnValue(false);
    authMock.mockResolvedValue({
      user: {
        id: "user-1",
        provider: "google",
        authConfidence: "oidc",
        authAt: Date.now() - 1000 * 60 * 60,
      },
    });

    const res = await POST(makeRequest({ modules: {} }));
    const payload = await res.json();

    expect(res.status).toBe(403);
    expect(payload.error).toContain("re-authentication required");
  });

  it("POST rejects invalid JSON", async () => {
    isAnonymousCookieMock.mockReturnValue(false);

    const res = await POST(makeRequest(new Error("bad json")));
    const payload = await res.json();

    expect(res.status).toBe(400);
    expect(payload.error).toBe("Invalid JSON body");
  });

  it("POST imports entries and strips id field", async () => {
    isAnonymousCookieMock.mockReturnValue(false);

    const create = vi.fn(async (_module: string, entry: Record<string, unknown>) => ({ id: "new", ...entry }));
    createDataProviderMock.mockReturnValue({
      list: vi.fn(),
      create,
      update: vi.fn(),
      delete: vi.fn(),
    });

    const archive = {
      version: 1,
      exportedAt: "2026-01-01T00:00:00.000Z",
      modules: {
        karma: [
          { id: "old-id", date: "2026-01-01", action: "Serve" },
          { date: "2026-01-02", action: "Help" },
        ],
      },
    };

    const res = await POST(makeRequest(archive));
    const payload = await res.json();

    expect(res.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.results.karma.imported).toBe(2);

    expect(create).toHaveBeenNthCalledWith(1, "karma", {
      date: "2026-01-01",
      action: "Serve",
    }, { userId: "user-1" });
    expect(create).toHaveBeenNthCalledWith(2, "karma", {
      date: "2026-01-02",
      action: "Help",
    }, { userId: "user-1" });
  });
});
