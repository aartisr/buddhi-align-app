export const ANONYMOUS_COOKIE_NAME = "buddhi-align-anonymous";
export const ANONYMOUS_COOKIE_VALUE = "1";

export function isAnonymousCookie(value?: string): boolean {
  return value === ANONYMOUS_COOKIE_VALUE;
}
