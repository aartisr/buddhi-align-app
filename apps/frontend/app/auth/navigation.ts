export function sanitizeRelativeCallbackUrl(callbackUrl: string | undefined, fallback = "/"): string {
  if (!callbackUrl) return fallback;
  if (!callbackUrl.startsWith("/")) return fallback;
  if (callbackUrl.startsWith("//")) return fallback;
  return callbackUrl;
}

export function buildSignInHref(
  callbackUrl: string,
  options?: { error?: "OIDCRequired" | "StepUpRequired" },
): string {
  const params = new URLSearchParams();
  params.set("callbackUrl", callbackUrl);
  if (options?.error) {
    params.set("error", options.error);
  }
  return `/sign-in?${params.toString()}`;
}