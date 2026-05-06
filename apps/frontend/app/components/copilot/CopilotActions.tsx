"use client";

import Link from "next/link";

import { logEvent } from "@/app/lib/logEvent";
import type { CopilotAction } from "@/app/lib/copilot/types";

export default function CopilotActions({
  actions,
  onNavigate,
}: {
  actions: CopilotAction[];
  onNavigate?: () => void;
}) {
  if (actions.length === 0) return null;

  return (
    <div className="app-copilot-actions" aria-label="Suggested actions">
      {actions.map((action) => (
        <Link
          key={`${action.type}:${action.href}:${action.label}`}
          href={action.href}
          className="app-copilot-action"
          onClick={() => {
            logEvent("copilot_action_clicked", {
              type: action.type,
              href: action.href,
              moduleKey: action.moduleKey,
            });
            onNavigate?.();
          }}
        >
          {action.label}
        </Link>
      ))}
    </div>
  );
}
