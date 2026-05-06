export type CopilotSourceType =
  | "public_page"
  | "llms_reference"
  | "homepage_faq"
  | "homepage_highlight"
  | "share_snippet"
  | "community_category"
  | "community_topic"
  | "autograph_profile"
  | "private_practice_summary";

export type CopilotVisibility = "public" | "private";

export type CopilotConfidence = "high" | "medium" | "low";

export type CopilotActionType =
  | "draft_practice_entry"
  | "draft_support_report"
  | "navigate"
  | "open_community"
  | "open_autograph_profiles"
  | "open_support"
  | "start_module";

export interface CopilotDocument {
  id: string;
  sourceType: CopilotSourceType;
  title: string;
  url: string;
  text: string;
  summary?: string;
  moduleKey?: string;
  visibility: CopilotVisibility;
  lastModified?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface CopilotCitation {
  title: string;
  url: string;
  sourceType: CopilotSourceType;
}

export interface CopilotAction {
  type: CopilotActionType;
  label: string;
  href: string;
  moduleKey?: string;
}

export interface CopilotPageContext {
  path?: string;
  locale?: string;
  moduleKey?: string;
}

export interface CopilotChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface CopilotChatRequest {
  messages: CopilotChatMessage[];
  context?: CopilotPageContext;
}

export interface CopilotChatResponse {
  answer: string;
  citations: CopilotCitation[];
  actions: CopilotAction[];
  confidence: CopilotConfidence;
}

export interface CopilotRetrievalQuery {
  query: string;
  currentPath?: string;
  moduleKey?: string;
  sourceTypes?: CopilotSourceType[];
  userId?: string;
  limit: number;
}

export interface CopilotRetrievalProvider {
  search(query: CopilotRetrievalQuery): Promise<CopilotDocument[]>;
}

export type CopilotIntent =
  | "navigation"
  | "community"
  | "autograph"
  | "support"
  | "private_practice"
  | "public_answer"
  | "unknown";
