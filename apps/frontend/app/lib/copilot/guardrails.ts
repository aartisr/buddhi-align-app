import type { CopilotChatResponse } from "./types";

export type CopilotGuardrailKind = "private_data" | "prompt_injection";

export interface CopilotGuardrailDecision {
  kind: CopilotGuardrailKind;
  reason: string;
}

const promptInjectionMarkers = [
  "bypass",
  "developer message",
  "ignore previous",
  "ignore prior",
  "ignore the above",
  "jailbreak",
  "reveal your instructions",
  "show me your instructions",
  "system prompt",
];

const privateDataMarkers = [
  "all users",
  "another user",
  "another user's",
  "api key",
  "database password",
  "other users",
  "private journal",
  "raw entries",
  "secret",
  "service role",
  "someone else's",
  "supabase key",
  "token",
];

function includesAny(value: string, markers: readonly string[]): boolean {
  return markers.some((marker) => value.includes(marker));
}

export function detectCopilotGuardrail(query: string): CopilotGuardrailDecision | null {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return null;

  if (includesAny(normalized, promptInjectionMarkers)) {
    return {
      kind: "prompt_injection",
      reason: "The request appears to ask the copilot to ignore or reveal operating instructions.",
    };
  }

  if (includesAny(normalized, privateDataMarkers)) {
    return {
      kind: "private_data",
      reason: "The request appears to ask for secrets, raw private entries, or another user's data.",
    };
  }

  return null;
}

export function buildGuardrailResponse(decision: CopilotGuardrailDecision): CopilotChatResponse {
  const answer = decision.kind === "prompt_injection"
    ? "I can help with Buddhi Align pages, modules, community, Autograph Exchange, and your own signed-in practice summaries, but I cannot follow requests to bypass instructions or reveal internal prompts."
    : "I cannot reveal secrets, raw private entries, or another user's data. I can summarize your own signed-in practice activity at a high level without adding private journal text to the public copilot corpus.";

  return {
    answer,
    citations: [],
    actions: [],
    confidence: "high",
  };
}
