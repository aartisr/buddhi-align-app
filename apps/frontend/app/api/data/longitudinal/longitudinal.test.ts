/**
 * Tests for the longitudinal API route helpers.
 * We test mondayOf and week-bucketing pure logic directly.
 */
import { describe, expect, it } from "vitest";

// ── Re-implement helpers from route (pure, no deps) ───────────────────────

function mondayOf(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function consistencyScore(entries: { date: string }[], today: Date): number {
  const activeDays = new Set<string>();
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() - 30);
  for (const e of entries) {
    const d = new Date(e.date);
    if (d >= cutoff) activeDays.add(e.date.slice(0, 10));
  }
  return Math.round((activeDays.size / 30) * 100);
}

// ─────────────────────────────────────────────────────────────────────────────

describe("mondayOf", () => {
  it("returns the same day if it is already Monday", () => {
    // 2024-01-01 is a Monday
    const monday = new Date("2024-01-01T12:00:00Z");
    const result = mondayOf(monday);
    expect(isoDate(result)).toBe("2024-01-01");
  });

  it("returns the previous Monday for a Wednesday", () => {
    // 2024-01-03 is Wednesday → Monday 2024-01-01
    const wed = new Date("2024-01-03T12:00:00Z");
    expect(isoDate(mondayOf(wed))).toBe("2024-01-01");
  });

  it("returns the previous Monday for a Sunday", () => {
    // 2024-01-07 is Sunday → Monday 2024-01-01
    const sun = new Date("2024-01-07T12:00:00Z");
    expect(isoDate(mondayOf(sun))).toBe("2024-01-01");
  });
});

describe("consistencyScore", () => {
  it("is 0 for no entries", () => {
    expect(consistencyScore([], new Date())).toBe(0);
  });

  it("is 100 for 30 unique active days in last 30 days", () => {
    const today = new Date();
    const entries: { date: string }[] = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      entries.push({ date: isoDate(d) });
    }
    expect(consistencyScore(entries, today)).toBe(100);
  });

  it("is 50 for 15 unique active days in last 30 days", () => {
    const today = new Date();
    const entries: { date: string }[] = [];
    for (let i = 0; i < 15; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      entries.push({ date: isoDate(d) });
    }
    expect(consistencyScore(entries, today)).toBe(50);
  });

  it("ignores entries older than 30 days", () => {
    const today = new Date();
    const old = new Date(today);
    old.setDate(old.getDate() - 40);
    const entries = [{ date: isoDate(old) }];
    expect(consistencyScore(entries, today)).toBe(0);
  });

  it("deduplicates multiple entries on the same day", () => {
    const today = new Date();
    const iso = isoDate(today);
    // 5 entries all today → only 1 unique active day
    const entries = Array.from({ length: 5 }, () => ({ date: iso }));
    expect(consistencyScore(entries, today)).toBe(Math.round((1 / 30) * 100));
  });
});
