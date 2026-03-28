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
});
