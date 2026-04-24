const DEFAULT_BLOCKED_CALLBACK_PREFIXES = ["/api/auth", "/sign-in"] as const;

type CallbackUrlOptions = {
  origin?: string;
  blockedPrefixes?: readonly string[];
};

function isBlockedCallbackPath(path: string, blockedPrefixes: readonly string[]) {
  return blockedPrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`) || path.startsWith(`${prefix}?`));
}

function normalizeRelativeCallbackUrl(
  callbackUrl: string | undefined,
  options: CallbackUrlOptions = {},
): string | null {
  if (!callbackUrl) return null;

  const blockedPrefixes = options.blockedPrefixes ?? DEFAULT_BLOCKED_CALLBACK_PREFIXES;
  let candidate: string | null = null;

  if (callbackUrl.startsWith("/")) {
    if (callbackUrl.startsWith("//")) return null;
    candidate = callbackUrl;
  } else if (options.origin) {
    try {
      const parsed = new URL(callbackUrl);
      if (parsed.origin !== new URL(options.origin).origin) {
        return null;
      }
      candidate = `${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch {
      return null;
    }
  }

  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) {
    return null;
  }

  if (isBlockedCallbackPath(candidate, blockedPrefixes)) {
    return null;
  }

  return candidate;
}

export function sanitizeRelativeCallbackUrl(
  callbackUrl: string | undefined,
  fallback = "/",
  options: CallbackUrlOptions = {},
): string {
  return (
    normalizeRelativeCallbackUrl(callbackUrl, options) ??
    normalizeRelativeCallbackUrl(fallback, options) ??
    "/"
  );
}

export function getRelativeCallbackUrlFromReferer(
  referer: string | null | undefined,
  origin: string | undefined,
  fallback = "/",
): string {
  return sanitizeRelativeCallbackUrl(referer ?? undefined, fallback, { origin });
}

export function buildSignInHref(
  callbackUrl: string,
  options?: { error?: "OIDCRequired" | "StepUpRequired" },
): string {
  const params = new URLSearchParams();
  params.set("callbackUrl", sanitizeRelativeCallbackUrl(callbackUrl));
  if (options?.error) {
    params.set("error", options.error);
  }
  return `/sign-in?${params.toString()}`;
}
