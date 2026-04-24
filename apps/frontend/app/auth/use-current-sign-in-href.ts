"use client";

import { useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { buildSignInHref, sanitizeRelativeCallbackUrl } from "./navigation";

export function useCurrentCallbackUrl(fallback = "/"): string {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return useMemo(() => {
    const query = searchParams?.toString();
    return sanitizeRelativeCallbackUrl(`${pathname || fallback}${query ? `?${query}` : ""}`, fallback);
  }, [fallback, pathname, searchParams]);
}

export function useCurrentSignInHref(fallback = "/"): string {
  const callbackUrl = useCurrentCallbackUrl(fallback);

  return useMemo(() => buildSignInHref(callbackUrl), [callbackUrl]);
}
