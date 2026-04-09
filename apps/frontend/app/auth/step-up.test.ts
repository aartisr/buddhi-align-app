import { describe, expect, it } from "vitest";

import {
  getSessionAuthAtMs,
  hasRecentStepUp,
  isStepUpSensitivePath,
} from "./step-up";

describe("step-up", () => {
  it("extracts auth timestamp from number and string", () => {
    expect(getSessionAuthAtMs({ user: { authAt: 12345 } })).toBe(12345);
    expect(getSessionAuthAtMs({ user: { authAt: "12345" } })).toBe(12345);
    expect(getSessionAuthAtMs({ user: { authAt: "invalid" } })).toBeNull();
  });

  it("accepts recent auth and rejects stale auth", () => {
    const now = 1_000_000;
    expect(hasRecentStepUp({ user: { authAt: now - 1000 } }, now, 5_000)).toBe(true);
    expect(hasRecentStepUp({ user: { authAt: now - 10_000 } }, now, 5_000)).toBe(false);
  });

  it("detects step-up sensitive paths", () => {
    expect(isStepUpSensitivePath("/admin")).toBe(true);
    expect(isStepUpSensitivePath("/api/admin/incident")).toBe(true);
    expect(isStepUpSensitivePath("/api/data/export")).toBe(true);
    expect(isStepUpSensitivePath("/karma-yoga")).toBe(false);
  });
});
