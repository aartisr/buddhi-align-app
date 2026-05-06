import { createDataProvider, type DataProvider, type ModuleEntry } from "@buddhi-align/data-access";

import { ANALYTICS_MODULES, type AnalyticsModuleName } from "@/app/api/analytics/types";

import type { CopilotDocument } from "./types";

const PRIVATE_PRACTICE_TIMEOUT_MS = 1800;
const MODULE_LABELS: Record<AnalyticsModuleName, string> = {
  karma: "Karma Yoga",
  bhakti: "Bhakti Journal",
  jnana: "Jnana Reflection",
  dhyana: "Dhyana Meditation",
  vasana: "Vasana Tracker",
  dharma: "Dharma Planner",
};

type PracticeEntry = ModuleEntry & {
  date?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export interface PrivatePracticeSummary {
  totalEntries: number;
  counts: Record<AnalyticsModuleName, number>;
  activeDaysLast30: number;
  mostActiveModule: AnalyticsModuleName | null;
  latestDate: string | null;
  suggestedModule: AnalyticsModuleName;
  summaryText: string;
}

function isoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function normalizeEntryDate(entry: PracticeEntry): string | null {
  const rawDate = entry.date ?? entry.createdAt ?? entry.updatedAt;
  if (typeof rawDate !== "string") return null;
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return null;
  return isoDate(date);
}

function pickMostActive(counts: Record<AnalyticsModuleName, number>): AnalyticsModuleName | null {
  let best: AnalyticsModuleName | null = null;
  let bestCount = 0;

  for (const moduleName of ANALYTICS_MODULES) {
    const count = counts[moduleName];
    if (count > bestCount) {
      best = moduleName;
      bestCount = count;
    }
  }

  return best;
}

function pickSuggestedModule(counts: Record<AnalyticsModuleName, number>): AnalyticsModuleName {
  const zeroCountModule = ANALYTICS_MODULES.find((moduleName) => counts[moduleName] === 0);
  if (zeroCountModule) return zeroCountModule;

  return ANALYTICS_MODULES.reduce((leastActive, moduleName) =>
    counts[moduleName] < counts[leastActive] ? moduleName : leastActive,
  "dharma");
}

function buildSummaryText(summary: Omit<PrivatePracticeSummary, "summaryText">): string {
  const moduleSummary = ANALYTICS_MODULES
    .map((moduleName) => `${MODULE_LABELS[moduleName]}: ${summary.counts[moduleName]}`)
    .join("; ");
  const mostActive = summary.mostActiveModule
    ? MODULE_LABELS[summary.mostActiveModule]
    : "no single module yet";
  const nextModule = MODULE_LABELS[summary.suggestedModule];
  const latest = summary.latestDate ? ` Your latest recorded practice date is ${summary.latestDate}.` : "";

  return [
    `Your private Buddhi Align summary has ${summary.totalEntries} total practice entries.`,
    `Module balance: ${moduleSummary}.`,
    `Your most active area is ${mostActive}, and you were active on ${summary.activeDaysLast30} of the last 30 days.`,
    `${latest} A gentle next step is to open ${nextModule} and record one clear entry.`,
  ].join(" ").replace(/\s+/g, " ").trim();
}

async function withTimeout<T>(promise: Promise<T>, fallback: T): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<T>((resolve) => {
    timeout = setTimeout(() => resolve(fallback), PRIVATE_PRACTICE_TIMEOUT_MS);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeout) clearTimeout(timeout);
  });
}

async function listModuleEntries(
  provider: DataProvider,
  moduleName: AnalyticsModuleName,
  userId: string,
): Promise<PracticeEntry[]> {
  try {
    return await provider.list<PracticeEntry>(moduleName, { userId });
  } catch {
    return [];
  }
}

export async function buildPrivatePracticeSummary(
  userId: string,
  provider: DataProvider = createDataProvider(),
): Promise<PrivatePracticeSummary> {
  const moduleEntries = await withTimeout(
    Promise.all(ANALYTICS_MODULES.map((moduleName) => listModuleEntries(provider, moduleName, userId))),
    ANALYTICS_MODULES.map(() => [] as PracticeEntry[]),
  );
  const counts = Object.fromEntries(
    ANALYTICS_MODULES.map((moduleName, index) => [moduleName, moduleEntries[index]?.length ?? 0]),
  ) as Record<AnalyticsModuleName, number>;
  const allDates = moduleEntries
    .flat()
    .map(normalizeEntryDate)
    .filter((date): date is string => Boolean(date));
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - 29);
  const startDate = isoDate(start);
  const todayDate = isoDate(today);
  const activeDaysLast30 = new Set(allDates.filter((date) => date >= startDate && date <= todayDate)).size;
  const totalEntries = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const latestDate = allDates.sort().at(-1) ?? null;
  const mostActiveModule = pickMostActive(counts);
  const suggestedModule = pickSuggestedModule(counts);
  const summaryBase = {
    totalEntries,
    counts,
    activeDaysLast30,
    mostActiveModule,
    latestDate,
    suggestedModule,
  };

  return {
    ...summaryBase,
    summaryText: buildSummaryText(summaryBase),
  };
}

export async function buildPrivatePracticeDocuments(userId: string): Promise<CopilotDocument[]> {
  try {
    const summary = await buildPrivatePracticeSummary(userId);

    return [
      {
        id: `private-practice-summary:${userId}`,
        sourceType: "private_practice_summary",
        title: "Your Practice Summary",
        url: "/motivation-analytics",
        text: summary.summaryText,
        summary: summary.summaryText,
        moduleKey: summary.suggestedModule,
        visibility: "private",
        metadata: {
          totalEntries: summary.totalEntries,
          activeDaysLast30: summary.activeDaysLast30,
          suggestedModule: summary.suggestedModule,
          ...(summary.mostActiveModule ? { mostActiveModule: summary.mostActiveModule } : {}),
        },
      },
    ];
  } catch {
    return [];
  }
}
