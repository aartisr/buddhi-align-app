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
  type DiscourseSsoRequest,
} from "@/app/lib/discourse-sso";
import type { CommunityConfig } from "@/app/lib/community-config";

type ConfiguredDiscourse = NonNullable<CommunityConfig["discourse"]> & { ssoSecret: string };

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

function getRequiredSsoQuery(req: NextRequest):
  | { sso: string; sig: string }
  | NextResponse {
  const sso = req.nextUrl.searchParams.get("sso") ?? "";
  const sig = req.nextUrl.searchParams.get("sig") ?? "";

  if (!sso || !sig) {
    return NextResponse.json({ error: "Missing required sso and sig query parameters." }, { status: 400 });
  }

  return { sso, sig };
}

function getValidatedDiscourseConfig(config: CommunityConfig):
  | { discourse: ConfiguredDiscourse }
  | NextResponse {
  const validation = validateCommunityConfig(config);

  if (!validation.ok || config.provider !== "discourse" || !config.discourse?.ssoSecret) {
    return NextResponse.json({ error: "Discourse SSO is not configured." }, { status: 503 });
  }

  return { discourse: config.discourse as ConfiguredDiscourse };
}

function parseValidatedSsoRequest(
  sso: string,
  sig: string,
  ssoSecret: string,
): DiscourseSsoRequest | NextResponse {
  if (!isValidDiscourseSsoSignature(sso, sig, ssoSecret)) {
    return NextResponse.json({ error: "Invalid SSO signature." }, { status: 403 });
  }

  const request = parseDiscourseSsoRequest(sso);
  if (!request) {
    return NextResponse.json({ error: "Invalid SSO payload." }, { status: 400 });
  }

  return request;
}

function buildMappedRolesAndGroups(discourseConfig: ConfiguredDiscourse) {
  const adminCookie = cookies().get(ADMIN_COOKIE_NAME)?.value;
  const hasAppAdminAccess = isAdminCookieValid(adminCookie);
  const mergedGroups = mergeUniqueGroups(
    discourseConfig.ssoDefaultGroups,
    hasAppAdminAccess ? discourseConfig.ssoAdminGroups : undefined,
    hasAppAdminAccess ? discourseConfig.ssoModeratorGroups : undefined,
  );
  const mappedGroups = applyGroupPolicy(
    mergedGroups,
    discourseConfig.ssoAllowedGroups,
    discourseConfig.ssoDeniedGroups,
  );

  return {
    hasAppAdminAccess,
    mergedGroups,
    mappedGroups,
    admin: hasAppAdminAccess && discourseConfig.ssoGrantAdminFromAppAdmin,
    moderator: hasAppAdminAccess && discourseConfig.ssoGrantModeratorFromAppAdmin,
    shouldSyncGroups: discourseConfig.ssoGroupSyncMode === "sync",
  };
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const query = getRequiredSsoQuery(req);
  if (query instanceof NextResponse) return query;

  const config = getCommunityConfig();
  const validatedConfig = getValidatedDiscourseConfig(config);
  if (validatedConfig instanceof NextResponse) return validatedConfig;

  const request = parseValidatedSsoRequest(
    query.sso,
    query.sig,
    validatedConfig.discourse.ssoSecret,
  );
  if (request instanceof NextResponse) return request;

  const session = await auth();
  if (!session?.user?.id) {
    return buildSignInRedirect(req);
  }

  if (!session.user.email) {
    return NextResponse.json({ error: "Signed-in user must have an email for Discourse SSO." }, { status: 400 });
  }

  const roleMapping = buildMappedRolesAndGroups(validatedConfig.discourse);

  const redirectUrl = buildDiscourseSsoRedirectUrl(
    request,
    {
      externalId: session.user.id,
      email: session.user.email,
      username: session.user.name ?? session.user.email.split("@")[0],
      name: session.user.name ?? undefined,
      admin: roleMapping.admin,
      moderator: roleMapping.moderator,
      groups: roleMapping.shouldSyncGroups ? roleMapping.mappedGroups : undefined,
      addGroups: roleMapping.shouldSyncGroups ? undefined : roleMapping.mappedGroups,
    },
    validatedConfig.discourse.ssoSecret,
  );

  await recordObservabilityEvent({
    event: "community_discourse_sso_role_group_mapping_applied",
    source: "server",
    userId: session.user.id,
    data: {
      syncMode: validatedConfig.discourse.ssoGroupSyncMode,
      hasAppAdminAccess: roleMapping.hasAppAdminAccess,
      admin: roleMapping.admin,
      moderator: roleMapping.moderator,
      mappedGroups: roleMapping.mappedGroups,
      prePolicyGroupCount: roleMapping.mergedGroups.length,
      mappedGroupCount: roleMapping.mappedGroups.length,
    },
  });

  return NextResponse.redirect(redirectUrl);
}
