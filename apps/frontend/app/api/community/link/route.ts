import { NextRequest, NextResponse } from "next/server";
import { getCommunityConfig, validateCommunityConfig } from "@/app/lib/community-config";
import {
  buildCommunityUrl,
  isCommunityModuleKey,
} from "@/app/lib/community-links";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const moduleCandidate = req.nextUrl.searchParams.get("module");

  if (!isCommunityModuleKey(moduleCandidate)) {
    return NextResponse.json(
      { error: "Invalid or missing module query parameter." },
      { status: 400 },
    );
  }

  const config = getCommunityConfig();
  const validation = validateCommunityConfig(config);

  if (!validation.ok) {
    return NextResponse.json({ enabled: false, reason: "invalid_config" });
  }

  const url = buildCommunityUrl(moduleCandidate, config);

  if (!url) {
    return NextResponse.json({ enabled: false, reason: "not_available" });
  }

  return NextResponse.json({
    enabled: true,
    provider: config.provider,
    module: moduleCandidate,
    url,
  });
}
