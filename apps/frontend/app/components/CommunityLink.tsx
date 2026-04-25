"use client";

import { useEffect, useState } from "react";
import { logEvent } from "@/app/lib/logEvent";

interface CommunityLinkPayload {
  enabled: boolean;
  provider?: string;
  module?: string;
  url?: string;
}

export function shouldOpenCommunityLinkInNewTab(_href?: string, _currentOrigin?: string): boolean {
  return false;
}

export default function CommunityLink({
  moduleKey,
  label = "Join Community",
}: {
  moduleKey: string;
  label?: string;
}) {
  const [payload, setPayload] = useState<CommunityLinkPayload | null>(null);

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

  if (!payload?.enabled || !payload.url) {
    return null;
  }

  const opensNewTab = shouldOpenCommunityLinkInNewTab(payload.url);

  return (
    <a
      href={payload.url}
      target={opensNewTab ? "_blank" : undefined}
      rel={opensNewTab ? "noopener noreferrer" : undefined}
      className="app-user-action inline-flex px-3 py-2 rounded-lg text-sm"
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
