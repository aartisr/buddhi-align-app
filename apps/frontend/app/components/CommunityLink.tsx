"use client";

import { useEffect, useState } from "react";
import { logEvent } from "@/app/lib/logEvent";

interface CommunityLinkPayload {
  enabled: boolean;
  provider?: string;
  module?: string;
  url?: string;
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

  return (
    <a
      href={payload.url}
      target="_blank"
      rel="noopener noreferrer"
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
