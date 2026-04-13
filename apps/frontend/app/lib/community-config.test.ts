import { describe, expect, it } from "vitest";
import { getCommunityConfig, validateCommunityConfig } from "./community-config";

describe("community-config", () => {
  it("defaults to disabled none provider", () => {
    const config = getCommunityConfig({});

    expect(config.enabled).toBe(false);
    expect(config.provider).toBe("none");
    expect(validateCommunityConfig(config)).toEqual({
      ok: true,
      errors: [],
      warnings: [],
    });
  });

  it("uses explicit provider configuration when set", () => {
    const config = getCommunityConfig({
      COMMUNITY_INTEGRATION_PROVIDER: "discourse",
      DISCOURSE_BASE_URL: "https://community.example.org",
    });

    expect(config.enabled).toBe(true);
    expect(config.provider).toBe("discourse");
    expect(config.discourse?.baseUrl).toBe("https://community.example.org");
  });

  it("supports legacy DISCOURSE_INTEGRATION_ENABLED for backward compatibility", () => {
    const config = getCommunityConfig({
      DISCOURSE_INTEGRATION_ENABLED: "true",
      DISCOURSE_BASE_URL: "https://community.example.org",
    });

    expect(config.provider).toBe("discourse");
    expect(config.enabled).toBe(true);
  });
});
