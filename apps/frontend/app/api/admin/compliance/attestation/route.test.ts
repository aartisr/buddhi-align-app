import { describe, expect, it, vi } from "vitest";

const {
  requireAdminApiAccessMock,
  writeAdminAuditMock,
  recordObservabilityEventMock,
} = vi.hoisted(() => ({
  requireAdminApiAccessMock: vi.fn(),
  writeAdminAuditMock: vi.fn(),
  recordObservabilityEventMock: vi.fn(),
}));

vi.mock("../../_auth", () => ({
  requireAdminApiAccess: requireAdminApiAccessMock,
}));

vi.mock("@/app/admin/_audit", () => ({
  writeAdminAudit: writeAdminAuditMock,
}));

vi.mock("@/app/lib/server-observability", () => ({
  recordObservabilityEvent: recordObservabilityEventMock,
}));

import { POST } from "./route";

function makeRequest(body: unknown) {
  return {
    json: async () => body,
  } as never;
}

describe("/api/admin/compliance/attestation route", () => {
  it("returns auth failure response when admin access is denied", async () => {
    requireAdminApiAccessMock.mockResolvedValueOnce({
      ok: false,
      response: new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 }),
    });

    const res = await POST(makeRequest({}));
    expect(res.status).toBe(403);
  });

  it("rejects invalid payload shape", async () => {
    requireAdminApiAccessMock.mockResolvedValueOnce({ ok: true, userId: "admin-1" });

    const res = await POST(makeRequest({ controls: "bad", attestations: [] }));
    const payload = await res.json();

    expect(res.status).toBe(400);
    expect(String(payload.error)).toContain("Invalid request");
  });

  it("evaluates controls and returns report", async () => {
    requireAdminApiAccessMock.mockResolvedValueOnce({ ok: true, userId: "admin-1" });

    const res = await POST(
      makeRequest({
        controls: [
          {
            id: "AWA-CTRL-01",
            title: "OIDC policy",
            claimType: "control.auth.oidc",
            requiredClaimKeys: ["providerPolicy"],
            trustedIssuers: ["did:example:auditor"],
            requireAnchor: true,
          },
        ],
        attestations: [
          {
            id: "att-1",
            scheme: "w3c-vc",
            subject: "service:frontend",
            issuer: "did:example:auditor",
            issuedAt: "2026-04-01T00:00:00.000Z",
            validUntil: "2026-05-01T00:00:00.000Z",
            claimType: "control.auth.oidc",
            claims: {
              providerPolicy: "oidc-only",
            },
            digest: "sha256:abc123",
            anchors: [
              {
                network: "polygon",
                transactionId: "0xabc",
                digest: "sha256:abc123",
                anchoredAt: "2026-04-01T01:00:00.000Z",
              },
            ],
          },
        ],
      }),
    );

    const payload = await res.json();
    expect(res.status).toBe(200);
    expect(payload.report.passed).toBe(true);
    expect(payload.report.passedCount).toBe(1);
    expect(payload.report.totalCount).toBe(1);

    expect(writeAdminAuditMock).toHaveBeenCalledTimes(1);
    expect(recordObservabilityEventMock).toHaveBeenCalledTimes(1);
  });
});