import { MODULE_CATALOG } from "@/app/i18n/config";
import { publicPageProfiles } from "@/app/lib/public-content";

import { buildCopilotPracticeDraftAction } from "./module-drafts";
import type { CopilotAction, CopilotDocument, CopilotIntent, CopilotPageContext } from "./types";

const ROUTE_LABELS = new Map<string, string>(
  publicPageProfiles.map((profile) => [profile.path, profile.title] as const),
);

for (const moduleItem of MODULE_CATALOG) {
  ROUTE_LABELS.set(moduleItem.href, moduleItem.key === "autograph" ? "Autograph Exchange" : ROUTE_LABELS.get(moduleItem.href) ?? moduleItem.href);
}

function actionLabelForDocument(document: CopilotDocument): string {
  if (document.url === "/community") return "Open Community";
  if (document.url === "/profiles") return "View Profiles";
  if (document.url === "/support") return "Report Issue";
  if (document.url === "/share") return "Open Share Kit";
  if (document.moduleKey && document.moduleKey !== "autograph-profiles") return `Open ${ROUTE_LABELS.get(document.url) ?? document.title}`;
  return `Open ${document.title}`;
}

function actionTypeForDocument(document: CopilotDocument): CopilotAction["type"] {
  if (document.url.startsWith("/community")) return "open_community";
  if (document.url.startsWith("/profiles")) return "open_autograph_profiles";
  if (document.url === "/support") return "open_support";
  if (document.moduleKey) return "start_module";
  return "navigate";
}

function makeAction(document: CopilotDocument): CopilotAction | null {
  if (!document.url.startsWith("/")) return null;
  if (document.sourceType === "llms_reference") return null;
  if (document.sourceType === "homepage_faq" || document.sourceType === "homepage_highlight") return null;
  if (document.sourceType === "share_snippet" && document.url !== "/share") return null;

  return {
    type: actionTypeForDocument(document),
    label: actionLabelForDocument(document),
    href: document.url,
    moduleKey: document.moduleKey,
  };
}

function addAction(actions: CopilotAction[], action: CopilotAction | null): void {
  if (!action) return;
  if (actions.some((item) => item.href === action.href && item.label === action.label)) return;
  actions.push(action);
}

function supportCategoryForQuery(query: string): string {
  const normalized = query.toLowerCase();
  const matchedRule = [
    { category: "autograph", markers: ["autograph"] },
    { category: "community", markers: ["community", "discourse"] },
    { category: "accessibility", markers: ["accessibility", "screen reader", "keyboard"] },
    { category: "performance", markers: ["slow", "performance", "loading"] },
    { category: "sign-in", markers: ["sign", "login", "account"] },
    { category: "privacy-security", markers: ["privacy", "security"] },
  ].find((rule) => rule.markers.some((marker) => normalized.includes(marker)));

  return matchedRule?.category ?? "bug";
}

function queryLooksLikeReportableIssue(query: string): boolean {
  const normalized = query.toLowerCase();
  return [
    "bug",
    "broken",
    "crash",
    "doesn't work",
    "does not work",
    "error",
    "failed",
    "failing",
    "issue",
    "not loading",
    "won't load",
    "wont load",
  ].some((marker) => normalized.includes(marker));
}

function buildSupportDraftAction(query: string, context?: CopilotPageContext): CopilotAction {
  const params = new URLSearchParams({
    source: "copilot",
    category: supportCategoryForQuery(query),
    title: query.slice(0, 120),
    tryingToDo: `I asked Buddhi Align Copilot for help with: ${query}`.slice(0, 700),
    actualBehavior: "Please review this issue or question from the copilot conversation.".slice(0, 700),
  });

  if (context?.path?.startsWith("/")) {
    params.set("page", context.path);
  }

  return {
    type: "draft_support_report",
    label: "Draft Support Report",
    href: `/support?${params.toString()}`,
  };
}

export function buildCopilotActions(input: {
  intent: CopilotIntent;
  documents: CopilotDocument[];
  query: string;
  context?: CopilotPageContext;
}): CopilotAction[] {
  const actions: CopilotAction[] = [];
  const normalizedQuery = input.query.toLowerCase();
  const reportableIssue = input.intent === "support" || queryLooksLikeReportableIssue(input.query);
  const practiceDraftAction = buildCopilotPracticeDraftAction(input);

  if (reportableIssue) {
    addAction(actions, buildSupportDraftAction(input.query, input.context));
  }

  addAction(actions, practiceDraftAction);

  for (const document of input.documents.slice(0, 3)) {
    addAction(actions, makeAction(document));
  }

  if (input.intent === "community" || normalizedQuery.includes("community")) {
    addAction(actions, { type: "open_community", label: "Open Community", href: "/community" });
  }

  if (input.intent === "autograph" || normalizedQuery.includes("profile")) {
    addAction(actions, { type: "open_autograph_profiles", label: "View Profiles", href: "/profiles" });
  }

  if (reportableIssue) {
    addAction(actions, { type: "open_support", label: "Report Issue", href: "/support" });
  }

  return actions.slice(0, 4);
}
