import { describe, expect, it } from "vitest";
import type { CommunityProviderAdapter } from "./community/provider-types";
import {
  getCommunityConfig,
  validateCommunityConfigWithAdapters,
} from "./community-config";
import { buildCommunityUrl } from "./community-links";

const customProviderAdapter: CommunityProviderAdapter = {
  provider: "custom-forum",
  validate: () => ({
    ok: true,
    errors: [],
    warnings: [],
  }),
  buildModuleUrl: (moduleKey) => `https://forums.example.org/modules/${moduleKey}`,
};

describe("community extensibility", () => {
  it("supports adapter injection for new providers without changing core route/ui contracts", () => {
    const config = getCommunityConfig({
      COMMUNITY_INTEGRATION_PROVIDER: "custom-forum",
    });

    expect(config.enabled).toBe(true);
    expect(config.provider).toBe("custom-forum");

    const validation = validateCommunityConfigWithAdapters(config, [customProviderAdapter]);
    expect(validation.ok).toBe(true);

    const url = buildCommunityUrl("karma", config, [customProviderAdapter]);
    expect(url).toBe("https://forums.example.org/modules/karma");
  });
});
