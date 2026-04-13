import type { CommunityProviderId } from "@/app/lib/community-config";
import type { CommunityProviderAdapter } from "../provider-types";
import { discourseCommunityProviderAdapter } from "./discourse-provider";
import { noneCommunityProviderAdapter } from "./none-provider";

const BASE_PROVIDER_ADAPTERS: readonly CommunityProviderAdapter[] = [
  noneCommunityProviderAdapter,
  discourseCommunityProviderAdapter,
];

function indexAdapters(adapters: readonly CommunityProviderAdapter[]): Map<string, CommunityProviderAdapter> {
  const indexed = new Map<string, CommunityProviderAdapter>();
  for (const adapter of adapters) {
    indexed.set(String(adapter.provider), adapter);
  }
  return indexed;
}

export function getCommunityProviderAdapter(
  provider: CommunityProviderId,
  additionalAdapters: readonly CommunityProviderAdapter[] = [],
): CommunityProviderAdapter {
  const indexed = indexAdapters([...BASE_PROVIDER_ADAPTERS, ...additionalAdapters]);
  return indexed.get(String(provider)) ?? noneCommunityProviderAdapter;
}
