import { NextRequest, NextResponse } from 'next/server';
import { ANONYMOUS_COOKIE_NAME, isAnonymousCookie } from '@/app/auth/anonymous';
import { auth } from '@/auth';
import { createDataProvider } from '@buddhi-align/data-access';
import { listAnonymousEntries } from '../_anonymous-module-store';
import {
  ANALYTICS_MODULES,
  type AnalyticsModuleName,
  type AnalyticsPayload,
} from './types';

export type { AnalyticsPayload } from './types';

interface Entry {
  date?: string;
  [key: string]: unknown;
}

/** Return the current consecutive-day streak given a flat list of dated entries. */
function calcStreak(allEntries: Entry[]): number {
  const dateSet = new Set(
    allEntries
      .map((e) => (typeof e.date === 'string' ? e.date.slice(0, 10) : null))
      .filter(Boolean) as string[],
  );
  if (dateSet.size === 0) return 0;

  const cursor = new Date();
  let streak = 0;
  while (true) {
    const iso = cursor.toISOString().slice(0, 10);
    if (!dateSet.has(iso)) {
      if (streak === 0) {
        cursor.setDate(cursor.getDate() - 1);
        const isoYesterday = cursor.toISOString().slice(0, 10);
        if (dateSet.has(isoYesterday)) {
          streak = 1;
          cursor.setDate(cursor.getDate() - 1);
          continue;
        }
      }
      break;
    }
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const isAnon = isAnonymousCookie(req.cookies.get(ANONYMOUS_COOKIE_NAME)?.value);
  const session = isAnon ? null : await auth();
  const today = new Date().toISOString().slice(0, 10);

  const counts = {} as Record<AnalyticsModuleName, number>;
  const todayActivity = {} as Record<AnalyticsModuleName, boolean>;
  const allEntries: Entry[] = [];

  // Fetch all modules in parallel — avoids N sequential round-trips.
  const provider = isAnon ? null : createDataProvider();
  const modResults = await Promise.all(
    ANALYTICS_MODULES.map(async (mod) => {
      try {
        const entries: Entry[] = isAnon
          ? listAnonymousEntries(mod)
          : await provider!.list(mod, { userId: session?.user?.id });
        return { mod, entries };
      } catch {
        return { mod, entries: [] as Entry[] };
      }
    }),
  );

  for (const { mod, entries } of modResults) {
    counts[mod] = entries.length;
    todayActivity[mod] = entries.some(
      (e) => typeof e.date === 'string' && e.date.slice(0, 10) === today,
    );
    allEntries.push(...entries);
  }

  const totalEntries = Object.values(counts).reduce((a, b) => a + b, 0);
  const streak = calcStreak(allEntries);

  const mostActive: AnalyticsModuleName | null =
    totalEntries === 0
      ? null
      : (Object.entries(counts).sort(([, a], [, b]) => b - a)[0][0] as AnalyticsModuleName);

  const payload: AnalyticsPayload = { counts, totalEntries, streak, mostActive, todayActivity };
  return NextResponse.json(payload);
}
