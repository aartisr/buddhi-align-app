import type { AnalyticsModuleName, AnalyticsPayload } from "../api/analytics/types";

export interface RecommendationSignal {
  id: string;
  kind: "today-gap" | "balance" | "momentum";
  module: AnalyticsModuleName;
  confidence: number;
  rationale: {
    moduleCount: number;
    mostActiveCount: number;
    streak: number;
    totalEntries: number;
    missingToday: boolean;
  };
  href: string;
}

const MODULE_HREF: Record<AnalyticsModuleName, string> = {
  karma: "/karma-yoga",
  bhakti: "/bhakti-journal",
  jnana: "/jnana-reflection",
  dhyana: "/dhyana-meditation",
  vasana: "/vasana-tracker",
  dharma: "/dharma-planner",
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getMostActiveCount(payload: AnalyticsPayload): number {
  if (!payload.mostActive) return 0;
  return payload.counts[payload.mostActive] ?? 0;
}

export function buildPersonalizationSignals(payload: AnalyticsPayload): RecommendationSignal[] {
  const mostActiveCount = getMostActiveCount(payload);

  const sortedByCount = (Object.entries(payload.counts) as Array<[AnalyticsModuleName, number]>).sort(
    (a, b) => a[1] - b[1],
  );

  const todayGapModule = sortedByCount.find(([module]) => !payload.todayActivity[module])?.[0];
  const balanceModule = sortedByCount[0]?.[0];
  const momentumModule = payload.mostActive ?? sortedByCount.at(-1)?.[0];

  const seen = new Set<AnalyticsModuleName>();
  const signals: RecommendationSignal[] = [];

  if (todayGapModule) {
    const count = payload.counts[todayGapModule] ?? 0;
    const confidence = clamp(62 + (count <= 2 ? 16 : 8) + (payload.streak <= 2 ? 8 : 0), 55, 92);
    signals.push({
      id: `today-gap-${todayGapModule}`,
      kind: "today-gap",
      module: todayGapModule,
      confidence,
      rationale: {
        moduleCount: count,
        mostActiveCount,
        streak: payload.streak,
        totalEntries: payload.totalEntries,
        missingToday: true,
      },
      href: MODULE_HREF[todayGapModule],
    });
    seen.add(todayGapModule);
  }

  if (balanceModule && !seen.has(balanceModule)) {
    const count = payload.counts[balanceModule] ?? 0;
    const gap = Math.max(0, mostActiveCount - count);
    const confidence = clamp(58 + gap * 3 + (count === 0 ? 8 : 0), 52, 90);
    signals.push({
      id: `balance-${balanceModule}`,
      kind: "balance",
      module: balanceModule,
      confidence,
      rationale: {
        moduleCount: count,
        mostActiveCount,
        streak: payload.streak,
        totalEntries: payload.totalEntries,
        missingToday: !payload.todayActivity[balanceModule],
      },
      href: MODULE_HREF[balanceModule],
    });
    seen.add(balanceModule);
  }

  if (momentumModule && !seen.has(momentumModule)) {
    const count = payload.counts[momentumModule] ?? 0;
    const confidence = clamp(54 + Math.min(24, Math.floor(count / 2)) + Math.min(10, payload.streak), 50, 89);
    signals.push({
      id: `momentum-${momentumModule}`,
      kind: "momentum",
      module: momentumModule,
      confidence,
      rationale: {
        moduleCount: count,
        mostActiveCount,
        streak: payload.streak,
        totalEntries: payload.totalEntries,
        missingToday: !payload.todayActivity[momentumModule],
      },
      href: MODULE_HREF[momentumModule],
    });
  }

  return signals.slice(0, 3);
}
