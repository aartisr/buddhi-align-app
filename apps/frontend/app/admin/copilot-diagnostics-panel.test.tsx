import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import CopilotDiagnosticsPanel from "./CopilotDiagnosticsPanel";

describe("CopilotDiagnosticsPanel", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders healthy diagnostics payload", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        generatedAt: "2026-05-06T00:00:00.000Z",
        runtime: { provider: "local", enabled: true, hostedConfigured: false },
        checks: {
          localCorpus: { ok: true, documentCount: 45 },
          localRetrieval: { ok: true, resultCount: 3, latencyMs: 12 },
          hostedRetrieval: { configured: false, ok: false },
        },
        summary: { ok: true, issues: [], warnings: [] },
      }),
    } as Response);

    render(<CopilotDiagnosticsPanel />);

    expect(await screen.findByText("healthy")).toBeInTheDocument();
    expect(screen.getByTestId("copilot-diagnostics-runtime")).toHaveTextContent("provider=local");
    expect(screen.getByTestId("copilot-diagnostics-updated")).toHaveTextContent("2026-05-06T00:00:00.000Z");
  });

  it("shows an error response and refreshes diagnostics", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ error: "Forbidden" }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          generatedAt: "2026-05-06T00:01:00.000Z",
          runtime: { provider: "local", enabled: true, hostedConfigured: false },
          checks: {
            localCorpus: { ok: true, documentCount: 45 },
            localRetrieval: { ok: true, resultCount: 3, latencyMs: 8 },
            hostedRetrieval: { configured: false, ok: false },
          },
          summary: { ok: true, issues: [], warnings: [] },
        }),
      } as Response);

    render(<CopilotDiagnosticsPanel />);

    expect(await screen.findByTestId("copilot-diagnostics-error")).toHaveTextContent("Forbidden");

    fireEvent.click(screen.getByTestId("copilot-diagnostics-refresh"));

    await waitFor(() => {
      expect(screen.getByTestId("copilot-diagnostics-updated")).toHaveTextContent("2026-05-06T00:01:00.000Z");
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
