"use client";

import type { CopilotCitation } from "@/app/lib/copilot/types";

export default function CopilotCitations({ citations }: { citations: CopilotCitation[] }) {
  if (citations.length === 0) return null;

  return (
    <div className="app-copilot-citations" aria-label="Sources">
      {citations.map((citation) => (
        <a key={`${citation.url}:${citation.title}`} href={citation.url} className="app-copilot-citation">
          {citation.title}
        </a>
      ))}
    </div>
  );
}
