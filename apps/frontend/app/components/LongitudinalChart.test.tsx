import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import LongitudinalChart from "./LongitudinalChart";

vi.mock("next/dynamic", () => ({
  default: () => {
    return function MockChart() {
      return <div data-testid="apex-chart">chart</div>;
    };
  },
}));

vi.mock("../i18n/provider", () => ({
  useI18n: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "motivation.trend.title": "8-Week Practice Trend",
        "motivation.trend.subtitle": "Track practice evolution",
        "motivation.trend.consistency": "consistency score (last 30 days)",
        "motivation.trend.growth": "Fastest growing this week:",
        "layout.module.karma": "Karma",
      };
      return map[key] ?? key;
    },
  }),
}));

vi.mock("../lib/logEvent", () => ({
  logEvent: vi.fn(),
}));

describe("LongitudinalChart", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders insight text and chart after fetch", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          consistencyScore: 67,
          growthModule: "karma",
          weeks: [
            {
              weekStart: "2026-02-02",
              counts: { karma: 1, bhakti: 0, jnana: 0, dhyana: 0, vasana: 0, dharma: 0 },
              total: 1,
            },
          ],
        }),
      })),
    );

    render(<LongitudinalChart />);

    await waitFor(() => {
      expect(screen.getByText("8-Week Practice Trend")).toBeInTheDocument();
    });

    expect(screen.getByText(/67%/)).toBeInTheDocument();
    expect(screen.getByTestId("apex-chart")).toBeInTheDocument();
  });
});
