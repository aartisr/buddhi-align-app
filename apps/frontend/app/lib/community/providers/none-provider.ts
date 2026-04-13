import type { CommunityProviderAdapter } from "../provider-types";

export const noneCommunityProviderAdapter: CommunityProviderAdapter = {
  provider: "none",
  buildModuleUrl: () => undefined,
  validate: () => ({
    ok: true,
    errors: [],
    warnings: [],
  }),
};
