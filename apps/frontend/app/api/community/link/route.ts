import { NextRequest, NextResponse } from "next/server";
import { getCommunityConfig, validateCommunityConfig } from "@/app/lib/community-config";
import {
  buildCommunityUrl,
  isCommunityModuleKey,
} from "@/app/lib/community-links";
import { resolveDiscourseModuleCategoryLink } from "@/app/lib/community/discourse-category-links";

const COMMUNITY_LINK_CACHE_CONTROL = "public, max-age=60, s-maxage=300, stale-while-revalidate=86400";

function communityLinkJson(payload: unknown, init?: ResponseInit): NextResponse {
  const response = NextResponse.json(payload, init);
  if (!init?.status || init.status < 400) {
    response.headers.set("Cache-Control", COMMUNITY_LINK_CACHE_CONTROL);
  }
  return response;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const moduleCandidate = req.nextUrl.searchParams.get("module");

  if (!isCommunityModuleKey(moduleCandidate)) {
    return communityLinkJson(
      { error: "Invalid or missing module query parameter." },
      { status: 400 },
    );
  }

  const config = getCommunityConfig();
  const validation = validateCommunityConfig(config);

  if (!validation.ok) {
    return communityLinkJson({ enabled: false, reason: "invalid_config" });
  }

  const resolvedDiscourseCategory = config.provider === "discourse"
    ? await resolveDiscourseModuleCategoryLink(moduleCandidate, config)
    : undefined;
  const url = resolvedDiscourseCategory?.href ?? buildCommunityUrl(moduleCandidate, config);

  if (!url) {
    return communityLinkJson({ enabled: false, reason: "not_available" });
  }

  return communityLinkJson({
    enabled: true,
    provider: config.provider,
    module: moduleCandidate,
    url,
    categoryId: resolvedDiscourseCategory?.categoryId,
  });
}
