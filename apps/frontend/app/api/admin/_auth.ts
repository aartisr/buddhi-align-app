import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { ADMIN_COOKIE_NAME, isAdminCookieValid } from "@/app/auth/admin";
import { hasOidcConfidence } from "@/app/auth/auth-confidence";
import { hasRecentStepUp } from "@/app/auth/step-up";
import { recordObservabilityEvent } from "@/app/lib/server-observability";

export async function requireAdminApiAccess(
  options?: { requireStepUp?: boolean },
): Promise<
  | { ok: true; userId: string }
  | { ok: false; response: NextResponse }
> {
  const session = await auth();
  if (!session?.user?.id) {
    await recordObservabilityEvent({
      event: "admin_api_unauthorized",
      source: "server",
      severity: "warning",
      statusCode: 401,
    });
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (!hasOidcConfidence(session)) {
    await recordObservabilityEvent({
      event: "admin_api_oidc_required_denied",
      source: "server",
      severity: "warning",
      statusCode: 403,
      userId: session.user.id,
    });
    return {
      ok: false,
      response: NextResponse.json({ error: "OIDC authentication required" }, { status: 403 }),
    };
  }

  if (options?.requireStepUp && !hasRecentStepUp(session as { user?: { authAt?: string | number } })) {
    await recordObservabilityEvent({
      event: "admin_api_stepup_required_denied",
      source: "server",
      severity: "warning",
      statusCode: 403,
      userId: session.user.id,
    });
    return {
      ok: false,
      response: NextResponse.json({ error: "Recent re-authentication required" }, { status: 403 }),
    };
  }

  const adminCookie = cookies().get(ADMIN_COOKIE_NAME)?.value;
  if (!isAdminCookieValid(adminCookie)) {
    await recordObservabilityEvent({
      event: "admin_api_forbidden",
      source: "server",
      severity: "warning",
      statusCode: 403,
      userId: session.user.id,
    });
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true, userId: session.user.id };
}
