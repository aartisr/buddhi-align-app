import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import DataPortability from "./DataPortability";

vi.mock("../i18n/provider", () => ({
  useI18n: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "settings.data.title": "Data Portability",
        "settings.data.subtitle": "Export or import your archive",
        "settings.data.note": "Imports append entries",
        "settings.export.label": "Export my data",
        "settings.import.label": "Import archive",
        "settings.import.success": "{{count}} entries imported successfully.",
        "settings.import.errorGeneric": "Import failed",
        "settings.import.reauthRequired": "Please sign in again before importing data.",
        "settings.import.errorTooLarge": "Import file is too large.",
        "settings.import.errorTimeout": "Import timed out",
      };
      return map[key] ?? key;
    },
  }),
}));

vi.mock("../lib/logEvent", () => ({
  logEvent: vi.fn(),
}));

describe("DataPortability", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders export and import controls", () => {
    render(<DataPortability />);

    expect(screen.getByRole("button", { name: "Export my data" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Import archive" })).toBeInTheDocument();
  });

  it("shows success message after valid import", async () => {
    const file = {
      text: async () =>
        JSON.stringify({
          version: 1,
          exportedAt: "2026-01-01",
          modules: { karma: [{ action: "serve" }] },
        }),
    } as File;

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          results: {
            karma: { imported: 1, errors: 0 },
            bhakti: { imported: 0, errors: 0 },
            jnana: { imported: 0, errors: 0 },
            dhyana: { imported: 0, errors: 0 },
            vasana: { imported: 0, errors: 0 },
            dharma: { imported: 0, errors: 0 },
          },
        }),
      })),
    );

    render(<DataPortability />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText("1 entries imported successfully.")).toBeInTheDocument();
    });
  });

  it("shows re-auth message when server returns 403", async () => {
    const file = {
      size: 1024,
      text: async () =>
        JSON.stringify({
          version: 1,
          exportedAt: "2026-01-01",
          modules: { karma: [{ action: "serve" }] },
        }),
    } as File;

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 403,
        json: async () => ({ error: "Recent re-authentication required for data import." }),
      })),
    );

    render(<DataPortability />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText("Please sign in again before importing data.")).toBeInTheDocument();
    });
  });

  it("shows file-too-large message before upload", async () => {
    const file = {
      size: 3 * 1024 * 1024,
      text: async () => JSON.stringify({ modules: {} }),
    } as File;

    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    render(<DataPortability />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText("Import file is too large.")).toBeInTheDocument();
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
