export const ANONYMOUS_COOKIE_NAME = "buddhi-align-anonymous";
export const ANONYMOUS_COOKIE_VALUE = "1";
export const ANONYMOUS_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

type AnonymousCookieSecureContext = {
  secure?: boolean;
};

export function isAnonymousCookie(value?: string): boolean {
  return value === ANONYMOUS_COOKIE_VALUE;
}

export function getAnonymousCookieOptions(context: AnonymousCookieSecureContext = {}) {
  return {
    name: ANONYMOUS_COOKIE_NAME,
    value: ANONYMOUS_COOKIE_VALUE,
    sameSite: "lax" as const,
    secure: context.secure ?? process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ANONYMOUS_COOKIE_MAX_AGE_SECONDS,
  };
}

export function getAnonymousCookieClearOptions() {
  return {
    name: ANONYMOUS_COOKIE_NAME,
    value: "",
    path: "/",
    maxAge: 0,
  };
}

export function hasAnonymousCookieInHeader(cookieHeader?: string): boolean {
  if (!cookieHeader) return false;
  return cookieHeader
    .split(";")
    .map((token) => token.trim())
    .some((token) => token === `${ANONYMOUS_COOKIE_NAME}=${ANONYMOUS_COOKIE_VALUE}`);
}
