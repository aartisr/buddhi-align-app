import { auth } from "@/auth";
import { ANONYMOUS_COOKIE_NAME, isAnonymousCookie } from "@/app/auth/anonymous";
import { hasOidcConfidence, isOidcSensitivePath } from "@/app/auth/auth-confidence";
import { hasRecentStepUp, isStepUpSensitivePath } from "@/app/auth/step-up";
import { NextResponse } from "next/server";

/**
 * Auth middleware: redirects unauthenticated users to /sign-in.
 * Public routes: /sign-in and all NextAuth API routes.
 */
export default auth((req) => {
  const { pathname, search } = req.nextUrl;
  const callbackUrl = `${pathname}${search}`;
  const isAnonymous = isAnonymousCookie(req.cookies.get(ANONYMOUS_COOKIE_NAME)?.value);

  const isPublic =
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/community/link") ||
    pathname.startsWith("/api/community/discourse/sso");

  if (!req.auth && !isPublic && !isAnonymous) {
    const signInUrl = new URL("/sign-in", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", callbackUrl);
    return NextResponse.redirect(signInUrl);
  }

  if (req.auth && isOidcSensitivePath(pathname) && !hasOidcConfidence(req.auth)) {
    const signInUrl = new URL("/sign-in", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", callbackUrl);
    signInUrl.searchParams.set("error", "OIDCRequired");
    return NextResponse.redirect(signInUrl);
  }

  if (req.auth && isStepUpSensitivePath(pathname) && !hasRecentStepUp(req.auth as { user?: { authAt?: string | number } })) {
    const signInUrl = new URL("/sign-in", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", callbackUrl);
    signInUrl.searchParams.set("error", "StepUpRequired");
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder assets
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
