import { describe, expect, it, vi } from "vitest";

const { recordObservabilityEventMock } = vi.hoisted(() => ({
  recordObservabilityEventMock: vi.fn(),
}));

vi.mock("@/app/lib/server-observability", () => ({
  inferObservabilitySeverity: () => "info",
  recordObservabilityEvent: recordObservabilityEventMock,
}));

import { POST } from "./route";

function makeRequest(body?: unknown) {
  return {
    json: async () => body,
  } as never;
}

describe("/api/obs route", () => {
  it("returns 400 for invalid payload", async () => {
    const res = await POST(makeRequest({}));
    const payload = await res.json();

    expect(res.status).toBe(400);
    expect(payload.error).toBe("Invalid event payload");
  });

  it("accepts valid event payload", async () => {
    const res = await POST(
      makeRequest({
        event: "analytics_fetch_success",
        data: { totalEntries: 12 },
        timestamp: "2026-03-28T00:00:00.000Z",
      }),
    );
    const payload = await res.json();

    expect(res.status).toBe(200);
    expect(payload.ok).toBe(true);
  });
});
