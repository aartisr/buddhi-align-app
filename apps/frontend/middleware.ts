import { auth } from "@/auth";
import { ANONYMOUS_COOKIE_NAME, getAnonymousCookieOptions, isAnonymousCookie } from "@/app/auth/anonymous";
import { hasOidcConfidence, isOidcSensitivePath } from "@/app/auth/auth-confidence";
import { hasRecentStepUp, isStepUpSensitivePath } from "@/app/auth/step-up";
import { NextResponse } from "next/server";

function buildSignInRedirect(origin: string, callbackUrl: string, error?: "OIDCRequired" | "StepUpRequired") {
  const signInUrl = new URL("/sign-in", origin);
  signInUrl.searchParams.set("callbackUrl", callbackUrl);
  if (error) {
    signInUrl.searchParams.set("error", error);
  }
  return NextResponse.redirect(signInUrl);
}

function isPublicAutographProfileApiPath(pathname: string, method: string): boolean {
  if (method !== "GET" && method !== "HEAD") {
    return false;
  }

  return /^\/api\/autographs\/profiles\/[^/]+(?:\/avatar)?$/.test(pathname);
}

/**
 * Auth middleware: redirects unauthenticated users to /sign-in for protected routes.
 * Public routes: public feature pages plus auth/community callback APIs.
 * First-time visitors to / are automatically placed in anonymous mode.
 */
export default auth((req) => {
  const { pathname, search } = req.nextUrl;
  const callbackUrl = `${pathname}${search}`;
  const isAnonymous = isAnonymousCookie(req.cookies.get(ANONYMOUS_COOKIE_NAME)?.value);
  const isHomePage = pathname === "/";
  const isRootPublicAsset = !pathname.startsWith("/api/") && /\.[^/]+$/.test(pathname);

  const isPublic =
    isRootPublicAsset ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/support") ||
    pathname.startsWith("/autograph-exchange") ||
    (pathname === "/profiles" || pathname.startsWith("/profiles/")) ||
    pathname.startsWith("/community") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/support") ||
    pathname.startsWith("/api/obs") ||
    pathname.startsWith("/api/community/link") ||
    pathname.startsWith("/api/community/discourse/sso") ||
    isPublicAutographProfileApiPath(pathname, req.method);

  if (!req.auth && !isAnonymous && isHomePage) {
    const response = NextResponse.next();
    response.cookies.set(getAnonymousCookieOptions());
    return response;
  }

  if (!req.auth && !isPublic && !isAnonymous) {
    return buildSignInRedirect(req.nextUrl.origin, callbackUrl);
  }

  if (req.auth && isOidcSensitivePath(pathname) && !hasOidcConfidence(req.auth)) {
    return buildSignInRedirect(req.nextUrl.origin, callbackUrl, "OIDCRequired");
  }

  if (req.auth && isStepUpSensitivePath(pathname) && !hasRecentStepUp(req.auth as { user?: { authAt?: string | number } })) {
    return buildSignInRedirect(req.nextUrl.origin, callbackUrl, "StepUpRequired");
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
