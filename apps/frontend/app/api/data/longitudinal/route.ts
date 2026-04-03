import { NextRequest, NextResponse } from 'next/server';
import { ANONYMOUS_COOKIE_NAME, isAnonymousCookie } from '@/app/auth/anonymous';
import { auth } from '@/auth';
import { createDataProvider } from '@buddhi-align/data-access';
import { listAnonymousEntries } from '../../_anonymous-module-store';
import { ANALYTICS_MODULES, type AnalyticsModuleName } from '../../analytics/types';

export interface WeeklyPoint {
  /** ISO date of start-of-week (Monday) */
  weekStart: string;
  counts: Record<AnalyticsModuleName, number>;
  total: number;
}

export interface LongitudinalPayload {
  /** Last 8 weeks, oldest first */
  weeks: WeeklyPoint[];
  /** 0–100: % of days in the last 30 days with at least one entry */
  consistencyScore: number;
  /** Module with highest growth week-over-week */
  growthModule: AnalyticsModuleName | null;
}

function mondayOf(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sun
  const diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const isAnon = isAnonymousCookie(req.cookies.get(ANONYMOUS_COOKIE_NAME)?.value);
  const session = isAnon ? null : await auth();

  // Collect all entries with their dates across every module — in parallel.
  const provider = isAnon ? null : createDataProvider();
  const modEntries = await Promise.all(
    ANALYTICS_MODULES.map(async (mod) => {
      try {
        const entries = isAnon
          ? listAnonymousEntries(mod)
          : await provider!.list(mod, { userId: session?.user?.id });
        return entries
          .filter((e) => typeof e.date === 'string')
          .map((e) => ({ date: (e.date as string).slice(0, 10) }));
      } catch {
        return [];
      }
    }),
  );
  const allByModule = Object.fromEntries(
    ANALYTICS_MODULES.map((mod, i) => [mod, modEntries[i]]),
  ) as Record<AnalyticsModuleName, { date: string }[]>;

  // Build 8-week buckets (most recent first during construction, reversed at end)
  const today = new Date();
  const weeks: WeeklyPoint[] = [];

  for (let w = 7; w >= 0; w--) {
    const weekStart = mondayOf(new Date(today));
    weekStart.setDate(weekStart.getDate() - w * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const counts = {} as Record<AnalyticsModuleName, number>;
    let total = 0;
    for (const mod of ANALYTICS_MODULES) {
      const c = allByModule[mod].filter(
        (e) => e.date >= isoDate(weekStart) && e.date < isoDate(weekEnd),
      ).length;
      counts[mod] = c;
      total += c;
    }
    weeks.push({ weekStart: isoDate(weekStart), counts, total });
  }

  // Consistency score: % of last 30 calendar days with activity
  const activeDays = new Set<string>();
  for (const mod of ANALYTICS_MODULES) {
    for (const e of allByModule[mod]) {
      const d = new Date(e.date);
      const cutoff = new Date(today);
      cutoff.setDate(cutoff.getDate() - 30);
      if (d >= cutoff) activeDays.add(e.date);
    }
  }
  const consistencyScore = Math.round((activeDays.size / 30) * 100);

  // Growth module: biggest positive delta last week vs. the week before
  const lastWeek = weeks[7];
  const prevWeek = weeks[6];
  let growthModule: AnalyticsModuleName | null = null;
  let maxDelta = 0;
  for (const mod of ANALYTICS_MODULES) {
    const delta = (lastWeek?.counts[mod] ?? 0) - (prevWeek?.counts[mod] ?? 0);
    if (delta > maxDelta) { maxDelta = delta; growthModule = mod; }
  }

  const payload: LongitudinalPayload = { weeks, consistencyScore, growthModule };
  return NextResponse.json(payload);
}
