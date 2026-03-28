/**
 * Tests for the analytics API route helpers.
 *
 * We test the calcStreak logic in isolation by re-implementing
 * the same algorithm here (pure function, no side-effects).
 * The full GET handler is an integration concern tested elsewhere.
 */
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { ANALYTICS_MODULES } from "../analytics/types";

// ── Pure calcStreak logic (mirrors route.ts implementation) ───────────────
interface Entry { date?: string; [key: string]: unknown; }

function calcStreak(allEntries: Entry[]): number {
  const dateSet = new Set(
    allEntries
      .map((e) => (typeof e.date === "string" ? e.date.slice(0, 10) : null))
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

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

describe("calcStreak", () => {
  it("returns 0 for empty entries", () => {
    expect(calcStreak([])).toBe(0);
  });

  it("returns 0 for entries with no date field", () => {
    expect(calcStreak([{ action: "something" }, { action: "else" }])).toBe(0);
  });

  it("returns 1 for a single entry today", () => {
    const today = isoDate(new Date());
    expect(calcStreak([{ date: today }])).toBe(1);
  });

  it("returns 1 for a single entry yesterday (today has no entry)", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(calcStreak([{ date: isoDate(yesterday) }])).toBe(1);
  });

  it("returns 0 for an entry 2 days ago (gap breaks streak)", () => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    expect(calcStreak([{ date: isoDate(twoDaysAgo) }])).toBe(0);
  });

  it("counts a multi-day consecutive streak including today", () => {
    const today = new Date();
    const entries: Entry[] = [0, 1, 2, 3].map((offset) => {
      const d = new Date(today);
      d.setDate(d.getDate() - offset);
      return { date: isoDate(d) };
    });
    expect(calcStreak(entries)).toBe(4);
  });

  it("stops counting at the first gap", () => {
    const today = new Date();
    // days 0, 1, 2 — gap at 3 — then 4, 5
    const offsets = [0, 1, 2, 4, 5];
    const entries: Entry[] = offsets.map((offset) => {
      const d = new Date(today);
      d.setDate(d.getDate() - offset);
      return { date: isoDate(d) };
    });
    expect(calcStreak(entries)).toBe(3);
  });

  it("deduplicates duplicate dates", () => {
    const today = isoDate(new Date());
    // Three entries all on today — should still count as streak of 1
    expect(calcStreak([{ date: today }, { date: today }, { date: today }])).toBe(1);
  });
});

// ── ANALYTICS_MODULES type coverage ──────────────────────────────────────────
describe("ANALYTICS_MODULES", () => {
  it("contains all six expected modules", () => {
    expect(ANALYTICS_MODULES).toContain("karma");
    expect(ANALYTICS_MODULES).toContain("bhakti");
    expect(ANALYTICS_MODULES).toContain("jnana");
    expect(ANALYTICS_MODULES).toContain("dhyana");
    expect(ANALYTICS_MODULES).toContain("vasana");
    expect(ANALYTICS_MODULES).toContain("dharma");
    expect(ANALYTICS_MODULES).toHaveLength(6);
  });
});
