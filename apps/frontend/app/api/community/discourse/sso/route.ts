import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { ADMIN_COOKIE_NAME, isAdminCookieValid } from "@/app/auth/admin";
import { getCommunityConfig, validateCommunityConfig } from "@/app/lib/community-config";
import { recordObservabilityEvent } from "@/app/lib/server-observability";
import {
  buildDiscourseSsoRedirectUrl,
  isValidDiscourseSsoSignature,
  parseDiscourseSsoRequest,
} from "@/app/lib/discourse-sso";

function buildSignInRedirect(req: NextRequest): NextResponse {
  const callbackUrl = `${req.nextUrl.pathname}${req.nextUrl.search}`;
  const signInUrl = new URL("/sign-in", req.nextUrl.origin);
  signInUrl.searchParams.set("callbackUrl", callbackUrl);
  return NextResponse.redirect(signInUrl);
}

function mergeUniqueGroups(...groupLists: Array<string[] | undefined>): string[] {
  const deduped = new Set<string>();
  for (const list of groupLists) {
    if (!list) continue;
    for (const item of list) {
      const normalized = item.trim().toLowerCase();
      if (normalized) deduped.add(normalized);
    }
  }
  return Array.from(deduped);
}

function applyGroupPolicy(
  groups: string[],
  allowedGroups: string[],
  deniedGroups: string[],
): string[] {
  const denied = new Set(deniedGroups.map((value) => value.trim().toLowerCase()).filter(Boolean));
  const allowed = new Set(allowedGroups.map((value) => value.trim().toLowerCase()).filter(Boolean));

  return groups.filter((group) => {
    const normalized = group.trim().toLowerCase();
    if (!normalized) return false;
    if (denied.has(normalized)) return false;
    if (allowed.size > 0 && !allowed.has(normalized)) return false;
    return true;
  });
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const sso = req.nextUrl.searchParams.get("sso") ?? "";
  const sig = req.nextUrl.searchParams.get("sig") ?? "";

  if (!sso || !sig) {
    return NextResponse.json({ error: "Missing required sso and sig query parameters." }, { status: 400 });
  }

  const config = getCommunityConfig();
  const validation = validateCommunityConfig(config);

  if (!validation.ok || config.provider !== "discourse" || !config.discourse?.ssoSecret) {
    return NextResponse.json({ error: "Discourse SSO is not configured." }, { status: 503 });
  }

  if (!isValidDiscourseSsoSignature(sso, sig, config.discourse.ssoSecret)) {
    return NextResponse.json({ error: "Invalid SSO signature." }, { status: 403 });
  }

  const request = parseDiscourseSsoRequest(sso);
  if (!request) {
    return NextResponse.json({ error: "Invalid SSO payload." }, { status: 400 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return buildSignInRedirect(req);
  }

  if (!session.user.email) {
    return NextResponse.json({ error: "Signed-in user must have an email for Discourse SSO." }, { status: 400 });
  }

  const adminCookie = cookies().get(ADMIN_COOKIE_NAME)?.value;
  const hasAppAdminAccess = isAdminCookieValid(adminCookie);
  const mergedGroups = mergeUniqueGroups(
    config.discourse.ssoDefaultGroups,
    hasAppAdminAccess ? config.discourse.ssoAdminGroups : undefined,
    hasAppAdminAccess ? config.discourse.ssoModeratorGroups : undefined,
  );
  const mappedGroups = applyGroupPolicy(
    mergedGroups,
    config.discourse.ssoAllowedGroups,
    config.discourse.ssoDeniedGroups,
  );
  const admin = hasAppAdminAccess && config.discourse.ssoGrantAdminFromAppAdmin;
  const moderator = hasAppAdminAccess && config.discourse.ssoGrantModeratorFromAppAdmin;
  const shouldSyncGroups = config.discourse.ssoGroupSyncMode === "sync";

  const redirectUrl = buildDiscourseSsoRedirectUrl(
    request,
    {
      externalId: session.user.id,
      email: session.user.email,
      username: session.user.name ?? session.user.email.split("@")[0],
      name: session.user.name ?? undefined,
      admin,
      moderator,
      groups: shouldSyncGroups ? mappedGroups : undefined,
      addGroups: shouldSyncGroups ? undefined : mappedGroups,
    },
    config.discourse.ssoSecret,
  );

  await recordObservabilityEvent({
    event: "community_discourse_sso_role_group_mapping_applied",
    source: "server",
    userId: session.user.id,
    data: {
      syncMode: config.discourse.ssoGroupSyncMode,
      hasAppAdminAccess,
      admin,
      moderator,
      mappedGroups,
      prePolicyGroupCount: mergedGroups.length,
      mappedGroupCount: mappedGroups.length,
    },
  });

  return NextResponse.redirect(redirectUrl);
}
