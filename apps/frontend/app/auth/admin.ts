import { createHash, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE_NAME = "buddhi-align-admin";
const ADMIN_COOKIE_SALT = "buddhi-align-admin-session-v1";

function safeCompare(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function getAdminPassword(): string {
  return (process.env.ADMIN_PASSWORD ?? "").trim();
}

export function isAdminConfigured(): boolean {
  return getAdminPassword().length > 0;
}

export function verifyAdminPassword(input: string): boolean {
  const expected = getAdminPassword();
  if (!expected) return false;
  return safeCompare(expected, input);
}

export function createAdminSessionValue(): string {
  const password = getAdminPassword();
  if (!password) return "";
  return createHash("sha256").update(`${ADMIN_COOKIE_SALT}:${password}`).digest("hex");
}

export function isAdminCookieValid(cookieValue?: string): boolean {
  if (!cookieValue) return false;
  const expected = createAdminSessionValue();
  if (!expected) return false;
  return safeCompare(expected, cookieValue);
}
