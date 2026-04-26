import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

const {
  createDataProviderMock,
  providerCreateMock,
  logServerErrorMock,
  recordObservabilityEventMock,
  revalidatePathMock,
} = vi.hoisted(() => ({
  createDataProviderMock: vi.fn(),
  providerCreateMock: vi.fn(),
  logServerErrorMock: vi.fn(),
  recordObservabilityEventMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}));

vi.mock("@buddhi-align/data-access", () => ({
  createDataProvider: createDataProviderMock,
}));

vi.mock("@/app/lib/server-error-log", () => ({
  logServerError: logServerErrorMock,
}));

vi.mock("@/app/lib/server-observability", () => ({
  recordObservabilityEvent: recordObservabilityEventMock,
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

import { POST } from "./route";

function makeRequest(body: unknown, ip = "203.0.113.10"): NextRequest {
  return new Request("http://localhost/api/support", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Vitest Browser",
      "X-Forwarded-For": ip,
    },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

describe("/api/support route", () => {
  beforeEach(() => {
    createDataProviderMock.mockReset();
    providerCreateMock.mockReset();
    logServerErrorMock.mockReset();
    recordObservabilityEventMock.mockReset();
    revalidatePathMock.mockReset();
    createDataProviderMock.mockReturnValue({ create: providerCreateMock });
    providerCreateMock.mockResolvedValue({ id: "support-row-1" });
  });

  it("stores a valid support report with sanitized fields", async () => {
    const response = await POST(
      makeRequest({
        category: "accessibility",
        severity: "high",
        title: "Keyboard focus gets lost",
        pageUrl: "https://buddhi-align.foreverlotus.com/community",
        tryingToDo: "I was trying to move through community topics using only the keyboard.",
        actualBehavior: "Focus disappeared after opening a topic and I could not tell where I was.",
        expectedBehavior: "Focus should stay visible and move into the topic content.",
        reproducibility: "always",
        contactEmail: "asha@example.com",
        consentToDiagnostics: true,
        diagnostics: {
          viewport: "390x844",
          userAgent: "Mobile Safari",
          languages: ["en-US", "en"],
        },
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.reportId).toMatch(/^BA-SUP-/);
    expect(providerCreateMock).toHaveBeenCalledWith(
      "__support_report",
      expect.objectContaining({
        category: "accessibility",
        severity: "high",
        status: "new",
        contactEmail: "asha@example.com",
        diagnostics: expect.objectContaining({ viewport: "390x844" }),
      }),
    );
    expect(recordObservabilityEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "support_report_created",
        severity: "warning",
      }),
    );
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin");
  });

  it("rejects reports that do not include enough reproduction context", async () => {
    const response = await POST(
      makeRequest({
        title: "Broken",
        tryingToDo: "short",
        actualBehavior: "short",
      }, "203.0.113.11"),
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toBe("Please add a short issue title.");
    expect(providerCreateMock).not.toHaveBeenCalled();
  });

  it("drops honeypot submissions without storing them", async () => {
    const response = await POST(
      makeRequest({
        company: "Search bot inc",
        title: "Keyboard focus gets lost",
        tryingToDo: "I was trying to move through community topics.",
        actualBehavior: "Focus disappeared after opening a topic.",
      }, "203.0.113.12"),
    );
    const payload = await response.json();

    expect(response.status).toBe(202);
    expect(payload.ok).toBe(true);
    expect(providerCreateMock).not.toHaveBeenCalled();
  });

  it("returns a clear save failure and logs server errors", async () => {
    providerCreateMock.mockRejectedValueOnce(new Error("database offline"));

    const response = await POST(
      makeRequest({
        title: "Profile photo upload fails",
        tryingToDo: "I was trying to upload a profile photo from my phone.",
        actualBehavior: "The upload failed after selecting a small image.",
      }, "203.0.113.13"),
    );
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error).toContain("could not save");
    expect(logServerErrorMock).toHaveBeenCalledWith("/api/support", "POST", expect.any(Error));
  });
});
