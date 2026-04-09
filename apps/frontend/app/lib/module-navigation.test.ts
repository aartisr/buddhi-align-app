import { describe, expect, it } from "vitest";

import { getAdjacentModuleKeys, MODULE_BY_KEY, RECOMMENDED_SEQUENCE } from "./module-navigation";

describe("module-navigation", () => {
  it("exposes a stable module lookup for all sequence keys", () => {
    for (const key of RECOMMENDED_SEQUENCE) {
      expect(MODULE_BY_KEY.has(key)).toBe(true);
    }
  });

  it("returns adjacent keys for middle sequence modules", () => {
    const result = getAdjacentModuleKeys("bhakti");
    expect(result.sequenceIndex).toBeGreaterThan(0);
    expect(result.previousModuleKey).toBe("karma");
    expect(result.nextModuleKey).toBe("dhyana");
  });

  it("returns null edges for first and unknown modules", () => {
    const first = getAdjacentModuleKeys("dharma");
    expect(first.previousModuleKey).toBeNull();

    const unknown = getAdjacentModuleKeys("unknown");
    expect(unknown.sequenceIndex).toBe(-1);
    expect(unknown.previousModuleKey).toBeNull();
    expect(unknown.nextModuleKey).toBeNull();
  });
});
