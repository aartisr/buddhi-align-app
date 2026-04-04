import type { AnalyticsPayload, AnalyticsModuleName } from "../api/analytics/types";
import type { LongitudinalPayload, WeeklyPoint } from "../api/data/longitudinal/route";

const MODULES: AnalyticsModuleName[] = [
  "karma",
  "bhakti",
  "jnana",
  "dhyana",
  "vasana",
  "dharma",
];

function isoDateDaysAgo(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

export function getSyntheticAnalyticsPayload(): AnalyticsPayload {
  const counts: Record<AnalyticsModuleName, number> = {
    karma: 18,
    bhakti: 14,
    jnana: 11,
    dhyana: 22,
    vasana: 9,
    dharma: 16,
  };

  const totalEntries = Object.values(counts).reduce((sum, n) => sum + n, 0);

  return {
    counts,
    totalEntries,
    streak: 12,
    mostActive: "dhyana",
    todayActivity: {
      karma: true,
      bhakti: true,
      jnana: false,
      dhyana: true,
      vasana: false,
      dharma: true,
    },
  };
}

function syntheticWeek(offset: number): WeeklyPoint {
  const weekStart = isoDateDaysAgo((7 - offset) * 7);
  const dhyanaTrend = 7 + offset;

  const counts: Record<AnalyticsModuleName, number> = {
    karma: 2 + (offset % 3),
    bhakti: 1 + ((offset + 1) % 3),
    jnana: 1 + (offset % 2),
    dhyana: dhyanaTrend,
    vasana: 1 + ((offset + 2) % 2),
    dharma: 2 + ((offset + 1) % 2),
  };

  const total = MODULES.reduce((sum, mod) => sum + counts[mod], 0);
  return { weekStart, counts, total };
}

export function getSyntheticLongitudinalPayload(): LongitudinalPayload {
  const weeks = Array.from({ length: 8 }, (_, i) => syntheticWeek(i));

  return {
    weeks,
    consistencyScore: 74,
    growthModule: "dhyana",
  };
}

export function shouldUseSyntheticAnalytics(payload: AnalyticsPayload): boolean {
  return payload.totalEntries === 0;
}

export function shouldUseSyntheticLongitudinal(payload: LongitudinalPayload): boolean {
  if (!payload.weeks.length) return true;
  return payload.weeks.every((week) =>
    MODULES.every((mod) => (week.counts[mod] ?? 0) === 0),
  );
}
