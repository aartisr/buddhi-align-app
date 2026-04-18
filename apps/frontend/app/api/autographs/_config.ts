import { autographService } from "@/app/lib/autographs/service";
import { isAutographFeatureEnabled } from "@/app/lib/autographs/feature";
import { requireSessionUserId } from "./_session";

export const autographRouteConfig = {
  service: autographService,
  getUserId: requireSessionUserId,
  isEnabled: isAutographFeatureEnabled,
};
