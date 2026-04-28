"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  buildCommunitySsoLoginHref,
  shouldWarmCommunityHref,
} from "@/app/lib/community-navigation";
import { logEvent } from "@/app/lib/logEvent";

interface CommunityLinkPayload {
  enabled: boolean;
  provider?: string;
  module?: string;
  url?: string;
  categoryId?: number;
}

export function shouldOpenCommunityLinkInNewTab(_href?: string, _currentOrigin?: string): boolean {
  return false;
}

export default function CommunityLink({
  moduleKey,
  label = "Discuss in Community",
}: {
  moduleKey: string;
  label?: string;
}) {
  const [payload, setPayload] = useState<CommunityLinkPayload | null>(null);
  const warmedHrefRef = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const res = await fetch(`/api/community/link?module=${encodeURIComponent(moduleKey)}`);
        if (!res.ok) return;
        const json = (await res.json()) as CommunityLinkPayload;
        if (!mounted) return;
        setPayload(json);
      } catch {
        return;
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [moduleKey]);

  const warmCommunityRoute = useCallback(() => {
    const href = payload?.url;
    if (!href || warmedHrefRef.current === href || typeof window === "undefined") return;
    if (!shouldWarmCommunityHref(href, window.location.origin)) return;

    warmedHrefRef.current = href;
    void fetch(href, {
      credentials: "include",
      cache: "force-cache",
    }).catch(() => undefined);
  }, [payload?.url]);

  useEffect(() => {
    if (!payload?.url || typeof window === "undefined") return undefined;

    const win = window as Window & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    if (win.requestIdleCallback) {
      const handle = win.requestIdleCallback(() => warmCommunityRoute(), { timeout: 3000 });
      return () => win.cancelIdleCallback?.(handle);
    }

    const timeout = window.setTimeout(() => warmCommunityRoute(), 1800);
    return () => window.clearTimeout(timeout);
  }, [payload?.url, warmCommunityRoute]);

  if (!payload?.enabled || !payload.url) {
    return null;
  }

  const opensNewTab = shouldOpenCommunityLinkInNewTab(payload.url);
  const href = buildCommunitySsoLoginHref(
    payload.url,
    typeof window === "undefined" ? "" : window.location.origin,
  );

  return (
    <a
      href={href}
      target={opensNewTab ? "_blank" : undefined}
      rel={opensNewTab ? "noopener noreferrer" : undefined}
      className="app-user-action inline-flex px-3 py-2 rounded-lg text-sm"
      onPointerEnter={warmCommunityRoute}
      onFocus={warmCommunityRoute}
      onTouchStart={warmCommunityRoute}
      onClick={() => {
        logEvent("community_link_clicked", {
          module: moduleKey,
          provider: payload.provider,
          url: payload.url,
        });
      }}
    >
      {label}
    </a>
  );
}
