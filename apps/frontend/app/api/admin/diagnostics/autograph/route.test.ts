import { afterEach, describe, expect, it, vi } from "vitest";

const {
  requireAdminApiAccessMock,
  createDataProviderMock,
  getAutographFeatureStatusMock,
  providerListMock,
} = vi.hoisted(() => ({
  requireAdminApiAccessMock: vi.fn(),
  createDataProviderMock: vi.fn(),
  getAutographFeatureStatusMock: vi.fn(),
  providerListMock: vi.fn(),
}));

vi.mock("../../_auth", () => ({
  requireAdminApiAccess: requireAdminApiAccessMock,
}));

vi.mock("@buddhi-align/data-access", () => ({
  createDataProvider: createDataProviderMock,
}));

vi.mock("@/app/lib/autographs/feature", () => ({
  getAutographFeatureStatus: getAutographFeatureStatusMock,
}));

import { GET } from "./route";

function buildServiceRoleJwt(role: string): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ role })).toString("base64url");
  return `${header}.${payload}.signature`;
}

describe("/api/admin/diagnostics/autograph", () => {
  const envSnapshot = {
    DATA_PROVIDER: process.env.DATA_PROVIDER,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    AUTH_SECRET: process.env.AUTH_SECRET,
  };

  afterEach(() => {
    process.env.DATA_PROVIDER = envSnapshot.DATA_PROVIDER;
    process.env.SUPABASE_URL = envSnapshot.SUPABASE_URL;
    process.env.SUPABASE_SERVICE_ROLE_KEY = envSnapshot.SUPABASE_SERVICE_ROLE_KEY;
    process.env.AUTH_SECRET = envSnapshot.AUTH_SECRET;

    requireAdminApiAccessMock.mockReset();
    createDataProviderMock.mockReset();
    getAutographFeatureStatusMock.mockReset();
    providerListMock.mockReset();
  });

  it("returns auth failure response when admin access is denied", async () => {
    requireAdminApiAccessMock.mockResolvedValueOnce({
      ok: false,
      response: new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 }),
    });

    const res = await GET();
    expect(res.status).toBe(403);
  });

  it("reports missing supabase configuration issues", async () => {
    requireAdminApiAccessMock.mockResolvedValueOnce({ ok: true, userId: "admin-1" });
    getAutographFeatureStatusMock.mockReturnValue({ enabled: true, route: "/autograph-exchange", apiBase: "/api/autographs" });

    process.env.DATA_PROVIDER = "supabase";
    process.env.SUPABASE_URL = "";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "";
    process.env.AUTH_SECRET = "";

    createDataProviderMock.mockImplementationOnce(() => {
      throw new Error("SupabaseDataProvider requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
    });

    const res = await GET();
    const payload = await res.json();

    expect(res.status).toBe(200);
    expect(payload.summary.ok).toBe(false);
    expect(payload.summary.issues.join(" ")).toContain("SUPABASE_URL is missing");
    expect(payload.summary.issues.join(" ")).toContain("SUPABASE_SERVICE_ROLE_KEY is missing");
    expect(payload.summary.issues.join(" ")).toContain("AUTH_SECRET is missing");
    expect(payload.checks.providerInitialization.ok).toBe(false);
  });

  it("reports invalid service role claim and storage probe failure", async () => {
    requireAdminApiAccessMock.mockResolvedValueOnce({ ok: true, userId: "admin-1" });
    getAutographFeatureStatusMock.mockReturnValue({ enabled: true, route: "/autograph-exchange", apiBase: "/api/autographs" });

    process.env.DATA_PROVIDER = "supabase";
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = buildServiceRoleJwt("authenticated");
    process.env.AUTH_SECRET = "secret";

    providerListMock.mockRejectedValueOnce(new Error("permission denied for table module_entries"));
    createDataProviderMock.mockReturnValue({ list: providerListMock });

    const res = await GET();
    const payload = await res.json();

    expect(res.status).toBe(200);
    expect(payload.checks.supabaseServiceRoleClaim).toBe("authenticated");
    expect(payload.summary.issues.join(" ")).toContain("not a service_role key");
    expect(payload.summary.issues.join(" ")).toContain("Autograph storage read probe failed");
    expect(payload.checks.storageProbe.ok).toBe(false);
  });

  it("returns ok summary when provider and storage probe succeed", async () => {
    requireAdminApiAccessMock.mockResolvedValueOnce({ ok: true, userId: "admin-1" });
    getAutographFeatureStatusMock.mockReturnValue({ enabled: true, route: "/autograph-exchange", apiBase: "/api/autographs" });

    process.env.DATA_PROVIDER = "supabase";
    process.env.SUPABASE_URL = "https://meovlfehmzerokbisjaq.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = buildServiceRoleJwt("service_role");
    process.env.AUTH_SECRET = "secret";

    providerListMock.mockResolvedValue([]);
    createDataProviderMock.mockReturnValue({ list: providerListMock });

    const res = await GET();
    const payload = await res.json();

    expect(res.status).toBe(200);
    expect(payload.summary.ok).toBe(true);
    expect(payload.summary.issues).toHaveLength(0);
    expect(payload.checks.providerInitialization.ok).toBe(true);
    expect(payload.checks.storageProbe.ok).toBe(true);
    expect(payload.runtime.projectRef).toBe("meovlfehmzerokbisjaq");
  });
});
