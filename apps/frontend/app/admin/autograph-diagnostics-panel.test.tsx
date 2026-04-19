import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import AutographDiagnosticsPanel from "./AutographDiagnosticsPanel";

describe("AutographDiagnosticsPanel", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders healthy diagnostics payload", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        generatedAt: "2026-04-19T00:00:00.000Z",
        runtime: { dataProvider: "supabase", projectRef: "meovlfehmzerokbisjaq" },
        checks: {
          supabaseServiceRoleClaim: "service_role",
          authSecretConfigured: true,
          supabaseUrlConfigured: true,
          supabaseServiceRoleKeyConfigured: true,
          providerInitialization: { ok: true },
          storageProbe: { ok: true },
        },
        summary: {
          ok: true,
          issues: [],
          warnings: [],
        },
      }),
    } as unknown as Response);

    render(<AutographDiagnosticsPanel />);

    await waitFor(() => {
      expect(screen.getByText("healthy")).toBeInTheDocument();
    });

    expect(screen.getByTestId("autograph-diagnostics-runtime")).toHaveTextContent("provider=supabase");
    expect(screen.getByTestId("autograph-diagnostics-updated")).toHaveTextContent("2026-04-19T00:00:00.000Z");
  });

  it("renders endpoint error details", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: "Provider initialization failed" }),
    } as unknown as Response);

    render(<AutographDiagnosticsPanel />);

    await waitFor(() => {
      expect(screen.getByTestId("autograph-diagnostics-error")).toHaveTextContent("Provider initialization failed");
    });
  });

  it("refreshes diagnostics on demand", async () => {
    const fetchMock = vi.spyOn(global, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          generatedAt: "2026-04-19T00:00:00.000Z",
          runtime: { dataProvider: "supabase", projectRef: "meovlfehmzerokbisjaq" },
          checks: {
            supabaseServiceRoleClaim: "service_role",
            authSecretConfigured: true,
            supabaseUrlConfigured: true,
            supabaseServiceRoleKeyConfigured: true,
            providerInitialization: { ok: true },
            storageProbe: { ok: true },
          },
          summary: {
            ok: true,
            issues: [],
            warnings: [],
          },
        }),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          generatedAt: "2026-04-19T00:01:00.000Z",
          runtime: { dataProvider: "supabase", projectRef: "meovlfehmzerokbisjaq" },
          checks: {
            supabaseServiceRoleClaim: "service_role",
            authSecretConfigured: true,
            supabaseUrlConfigured: true,
            supabaseServiceRoleKeyConfigured: true,
            providerInitialization: { ok: true },
            storageProbe: { ok: true },
          },
          summary: {
            ok: true,
            issues: [],
            warnings: [],
          },
        }),
      } as unknown as Response);

    render(<AutographDiagnosticsPanel />);

    await waitFor(() => {
      expect(screen.getByTestId("autograph-diagnostics-updated")).toHaveTextContent("2026-04-19T00:00:00.000Z");
    });

    fireEvent.click(screen.getByTestId("autograph-diagnostics-refresh"));

    await waitFor(() => {
      expect(screen.getByTestId("autograph-diagnostics-updated")).toHaveTextContent("2026-04-19T00:01:00.000Z");
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
