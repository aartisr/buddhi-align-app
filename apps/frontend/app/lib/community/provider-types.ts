import type {
  CommunityConfig,
  CommunityConfigValidationResult,
  CommunityProviderId,
} from "@/app/lib/community-config";
import type { CommunityModuleKey } from "./module-map";

export interface CommunityProviderAdapter {
  provider: CommunityProviderId;
  buildModuleUrl(moduleKey: CommunityModuleKey, config: CommunityConfig): string | undefined;
  validate(config: CommunityConfig): CommunityConfigValidationResult;
}
