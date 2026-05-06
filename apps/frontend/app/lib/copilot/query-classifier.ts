import type { CopilotIntent, CopilotSourceType } from "./types";

const NAVIGATION_TERMS = [
  "go to",
  "open",
  "take me",
  "navigate",
  "show me",
  "where is",
  "link",
];

const COMMUNITY_TERMS = [
  "community",
  "discussion",
  "discourse",
  "forum",
  "topic",
  "reply",
  "room",
];

const AUTOGRAPH_TERMS = [
  "autograph",
  "signature",
  "keepsake",
  "profile",
  "profiles",
  "teacher",
  "student",
];

const SUPPORT_TERMS = [
  "support",
  "bug",
  "issue",
  "report",
  "accessibility",
  "sign-in",
  "signin",
  "login",
  "privacy",
  "security",
  "performance",
];

const PRIVATE_PRACTICE_TERMS = [
  "my practice",
  "my entries",
  "my streak",
  "this week",
  "last week",
  "my progress",
  "what did i",
  "summarize my",
  "practice balance",
];

function includesAny(value: string, terms: readonly string[]): boolean {
  return terms.some((term) => value.includes(term));
}

export function classifyCopilotIntent(query: string): CopilotIntent {
  const normalized = query.trim().toLowerCase();

  if (!normalized) return "unknown";
  if (includesAny(normalized, PRIVATE_PRACTICE_TERMS)) return "private_practice";
  if (includesAny(normalized, SUPPORT_TERMS)) return "support";
  if (includesAny(normalized, COMMUNITY_TERMS)) return "community";
  if (includesAny(normalized, AUTOGRAPH_TERMS)) return "autograph";
  if (includesAny(normalized, NAVIGATION_TERMS)) return "navigation";

  return "public_answer";
}

export function sourceTypesForIntent(intent: CopilotIntent): CopilotSourceType[] | undefined {
  switch (intent) {
    case "community":
      return ["community_category", "community_topic", "public_page", "llms_reference"];
    case "autograph":
      return ["autograph_profile", "public_page", "llms_reference"];
    case "support":
      return ["public_page", "homepage_faq", "llms_reference"];
    case "private_practice":
      return ["public_page", "llms_reference"];
    default:
      return undefined;
  }
}
