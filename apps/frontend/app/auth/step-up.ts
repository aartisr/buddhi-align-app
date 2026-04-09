const DEFAULT_STEP_UP_MAX_AGE_MS = 15 * 60 * 1000;

export const STEP_UP_SENSITIVE_PATH_PREFIXES = [
  "/admin",
  "/admin-access",
  "/api/data/export",
  "/api/admin",
] as const;

function parseStepUpMaxAgeMs(value?: string): number {
  if (!value) return DEFAULT_STEP_UP_MAX_AGE_MS;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_STEP_UP_MAX_AGE_MS;
  return parsed;
}

export function getStepUpMaxAgeMs(): number {
  return parseStepUpMaxAgeMs(process.env.AUTH_STEP_UP_MAX_AGE_MS);
}

export function isStepUpSensitivePath(pathname: string): boolean {
  return STEP_UP_SENSITIVE_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

type StepUpSession = {
  user?: {
    authAt?: string | number;
  };
} | null | undefined;

export function getSessionAuthAtMs(session: StepUpSession): number | null {
  const authAt = session?.user?.authAt;
  if (typeof authAt === "number" && Number.isFinite(authAt) && authAt > 0) {
    return authAt;
  }
  if (typeof authAt === "string") {
    const parsed = Number(authAt);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
    const dateParsed = Date.parse(authAt);
    if (Number.isFinite(dateParsed)) return dateParsed;
  }
  return null;
}

export function hasRecentStepUp(
  session: StepUpSession,
  nowMs: number = Date.now(),
  maxAgeMs: number = getStepUpMaxAgeMs(),
): boolean {
  const authAtMs = getSessionAuthAtMs(session);
  if (!authAtMs) return false;
  return nowMs - authAtMs <= maxAgeMs;
}
