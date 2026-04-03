import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { ADMIN_COOKIE_NAME, isAdminCookieValid } from "@/app/auth/admin";

export async function requireAdminApiAccess(): Promise<
  | { ok: true; userId: string }
  | { ok: false; response: NextResponse }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const adminCookie = cookies().get(ADMIN_COOKIE_NAME)?.value;
  if (!isAdminCookieValid(adminCookie)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true, userId: session.user.id };
}
