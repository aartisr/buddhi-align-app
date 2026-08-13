import { describe, expect, it } from "vitest";

import { fitDescription, formatPublicDate } from "./content-format";

describe("content formatting", () => {
  it("normalizes and shortens descriptions at a word boundary", () => {
    expect(fitDescription("  A\n calm   practice  ")).toBe("A calm practice");
    expect(fitDescription("one two three four", 12)).toBe("one two.");
  });

  it("formats valid public dates and ignores invalid values", () => {
    expect(formatPublicDate("2026-08-13T12:00:00.000Z")).toBe("Aug 13, 2026");
    expect(formatPublicDate("not-a-date")).toBeUndefined();
    expect(formatPublicDate(undefined)).toBeUndefined();
  });
});
