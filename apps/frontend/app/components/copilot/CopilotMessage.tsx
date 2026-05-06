"use client";

import type { CopilotAction, CopilotCitation, CopilotConfidence } from "@/app/lib/copilot/types";

import CopilotActions from "./CopilotActions";
import CopilotCitations from "./CopilotCitations";

export interface CopilotUiMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: CopilotCitation[];
  actions?: CopilotAction[];
  confidence?: CopilotConfidence;
}

export default function CopilotMessage({
  message,
  onNavigate,
}: {
  message: CopilotUiMessage;
  onNavigate?: () => void;
}) {
  const isAssistant = message.role === "assistant";

  return (
    <article className={`app-copilot-message app-copilot-message--${message.role}`}>
      <p>{message.content}</p>
      {isAssistant ? <CopilotCitations citations={message.citations ?? []} /> : null}
      {isAssistant ? <CopilotActions actions={message.actions ?? []} onNavigate={onNavigate} /> : null}
    </article>
  );
}
