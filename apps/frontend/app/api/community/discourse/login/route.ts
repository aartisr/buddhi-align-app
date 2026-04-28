import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getCommunityConfig } from "@/app/lib/community-config";
import { normalizeCommunityReturnPath } from "@/app/lib/community-navigation";

function buildSameOriginRedirect(req: NextRequest, path: string): NextResponse {
  return NextResponse.redirect(new URL(path, req.nextUrl.origin));
}

function isDiscourseSsoConfigured() {
  const config = getCommunityConfig();
  return Boolean(
    config.enabled
      && config.provider === "discourse"
      && config.discourse?.enabled
      && config.discourse.ssoSecret,
  );
}

function buildDiscourseSsoStartPath(returnPath: string): string {
  const params = new URLSearchParams();
  params.set("return_path", returnPath);
  return `/community/session/sso?${params.toString()}`;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const returnPath = normalizeCommunityReturnPath(
    req.nextUrl.searchParams.get("returnPath") ?? undefined,
    req.nextUrl.origin,
  );

  if (!isDiscourseSsoConfigured()) {
    return buildSameOriginRedirect(req, returnPath);
  }

  const session = await auth();
  if (!session?.user?.id) {
    return buildSameOriginRedirect(req, returnPath);
  }

  if (!session.user.email) {
    return NextResponse.json(
      { error: "Signed-in user must have an email for Discourse SSO." },
      { status: 400 },
    );
  }

  return buildSameOriginRedirect(req, buildDiscourseSsoStartPath(returnPath));
}
