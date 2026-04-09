import { describe, expect, it } from "vitest";

import type { AnalyticsPayload } from "../api/analytics/types";
import { buildPersonalizationSignals } from "./personalization";

function makePayload(overrides?: Partial<AnalyticsPayload>): AnalyticsPayload {
  return {
    counts: {
      karma: 3,
      bhakti: 1,
      jnana: 0,
      dhyana: 6,
      vasana: 2,
      dharma: 4,
    },
    totalEntries: 16,
    streak: 2,
    mostActive: "dhyana",
    todayActivity: {
      karma: true,
      bhakti: false,
      jnana: false,
      dhyana: true,
      vasana: false,
      dharma: true,
    },
    ...overrides,
  };
}

describe("buildPersonalizationSignals", () => {
  it("returns up to three transparent recommendation signals", () => {
    const signals = buildPersonalizationSignals(makePayload());

    expect(signals.length).toBeGreaterThan(0);
    expect(signals.length).toBeLessThanOrEqual(3);
    for (const signal of signals) {
      expect(signal.confidence).toBeGreaterThanOrEqual(50);
      expect(signal.confidence).toBeLessThanOrEqual(92);
      expect(signal.href.startsWith("/")).toBe(true);
      expect(signal.rationale.totalEntries).toBe(16);
    }
  });

  it("prioritizes a missing-today module when available", () => {
    const signals = buildPersonalizationSignals(makePayload());
    expect(signals[0]?.kind).toBe("today-gap");
    expect(signals[0]?.rationale.missingToday).toBe(true);
  });

  it("still emits guidance when all modules have activity today", () => {
    const signals = buildPersonalizationSignals(
      makePayload({
        todayActivity: {
          karma: true,
          bhakti: true,
          jnana: true,
          dhyana: true,
          vasana: true,
          dharma: true,
        },
      }),
    );

    expect(signals.length).toBeGreaterThan(0);
    expect(signals.some((signal) => signal.kind === "balance" || signal.kind === "momentum")).toBe(true);
  });
});
