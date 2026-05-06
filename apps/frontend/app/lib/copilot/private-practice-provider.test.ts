import { describe, expect, it, vi } from "vitest";
import type { DataProvider, ModuleEntry } from "@buddhi-align/data-access";

import { buildPrivatePracticeSummary } from "./private-practice-provider";

function mockProvider(entries: Record<string, ModuleEntry[]>): DataProvider {
  return {
    list: vi.fn(async (moduleName: string) => entries[moduleName] ?? []),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  } as unknown as DataProvider;
}

describe("buildPrivatePracticeSummary", () => {
  it("summarizes counts without exposing raw journal text", async () => {
    const today = new Date().toISOString().slice(0, 10);
    const provider = mockProvider({
      karma: [
        { id: "k1", date: today, reflection: "private service note" },
        { id: "k2", date: today, reflection: "another private service note" },
      ],
      dhyana: [{ id: "d1", date: today, notes: "private meditation note" }],
    });

    const summary = await buildPrivatePracticeSummary("user-1", provider);

    expect(summary.totalEntries).toBe(3);
    expect(summary.counts.karma).toBe(2);
    expect(summary.counts.dhyana).toBe(1);
    expect(summary.mostActiveModule).toBe("karma");
    expect(summary.activeDaysLast30).toBeGreaterThanOrEqual(1);
    expect(summary.summaryText).toContain("Karma Yoga: 2");
    expect(summary.summaryText).not.toContain("private service note");
    expect(provider.list).toHaveBeenCalledWith("karma", { userId: "user-1" });
  });
});
