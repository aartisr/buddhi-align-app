import { afterEach, describe, expect, it, vi } from "vitest";

const { requireAdminApiAccessMock } = vi.hoisted(() => ({
  requireAdminApiAccessMock: vi.fn(),
}));

vi.mock("../../_auth", () => ({
  requireAdminApiAccess: requireAdminApiAccessMock,
}));

import { GET } from "./route";

describe("/api/admin/diagnostics/copilot", () => {
  const envSnapshot = {
    COPILOT_PROVIDER: process.env.COPILOT_PROVIDER,
    NEXT_PUBLIC_COPILOT_ENABLED: process.env.NEXT_PUBLIC_COPILOT_ENABLED,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_COPILOT_VECTOR_STORE_ID: process.env.OPENAI_COPILOT_VECTOR_STORE_ID,
  };

  afterEach(() => {
    process.env.COPILOT_PROVIDER = envSnapshot.COPILOT_PROVIDER;
    process.env.NEXT_PUBLIC_COPILOT_ENABLED = envSnapshot.NEXT_PUBLIC_COPILOT_ENABLED;
    process.env.OPENAI_API_KEY = envSnapshot.OPENAI_API_KEY;
    process.env.OPENAI_COPILOT_VECTOR_STORE_ID = envSnapshot.OPENAI_COPILOT_VECTOR_STORE_ID;
    requireAdminApiAccessMock.mockReset();
  });

  it("returns auth failure response when admin access is denied", async () => {
    requireAdminApiAccessMock.mockResolvedValueOnce({
      ok: false,
      response: new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 }),
    });

    const res = await GET();
    expect(res.status).toBe(403);
  });

  it("reports healthy local retrieval diagnostics", async () => {
    requireAdminApiAccessMock.mockResolvedValueOnce({ ok: true, userId: "admin-1" });
    process.env.COPILOT_PROVIDER = "local";
    process.env.NEXT_PUBLIC_COPILOT_ENABLED = "1";
    process.env.OPENAI_API_KEY = "";
    process.env.OPENAI_COPILOT_VECTOR_STORE_ID = "";

    const res = await GET();
    const payload = await res.json();

    expect(res.status).toBe(200);
    expect(payload.summary.ok).toBe(true);
    expect(payload.runtime.provider).toBe("local");
    expect(payload.runtime.hostedConfigured).toBe(false);
    expect(payload.checks.localCorpus.documentCount).toBeGreaterThanOrEqual(40);
    expect(payload.checks.localRetrieval.ok).toBe(true);
  });

  it("reports hosted provider misconfiguration as an issue", async () => {
    requireAdminApiAccessMock.mockResolvedValueOnce({ ok: true, userId: "admin-1" });
    process.env.COPILOT_PROVIDER = "openai-vector-store";
    process.env.OPENAI_API_KEY = "";
    process.env.OPENAI_COPILOT_VECTOR_STORE_ID = "";

    const res = await GET();
    const payload = await res.json();

    expect(res.status).toBe(200);
    expect(payload.summary.ok).toBe(false);
    expect(payload.summary.issues.join(" ")).toContain("OpenAI credentials");
  });
});
