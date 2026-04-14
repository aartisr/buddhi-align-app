import { NextRequest, NextResponse } from "next/server";
import { ANONYMOUS_COOKIE_NAME, isAnonymousCookie } from "@/app/auth/anonymous";
import { ANALYTICS_MODULES } from "./analytics/types";
import { logServerError } from "@/app/lib/server-error-log";

const VALID_MODULES = new Set<string>(ANALYTICS_MODULES);

export function isValidPracticeModule(moduleName: string): boolean {
  return VALID_MODULES.has(moduleName);
}

export function isAnonymousRequest(req: NextRequest): boolean {
  return isAnonymousCookie(req.cookies.get(ANONYMOUS_COOKIE_NAME)?.value);
}

export function buildModuleRoute(moduleName: string, id?: string): string {
  return id ? `/api/${moduleName}/${id}` : `/api/${moduleName}`;
}

export function parseJsonObjectBody(
  body: unknown,
):
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; response: NextResponse<{ error: string }> } {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Request body must be a non-null object" },
        { status: 400 },
      ),
    };
  }

  return { ok: true, data: body as Record<string, unknown> };
}

export async function serverErrorResponse(
  route: string,
  method: string,
  error: unknown,
  userId?: string,
): Promise<NextResponse<{ error: string }>> {
  await logServerError(route, method, error, userId);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}