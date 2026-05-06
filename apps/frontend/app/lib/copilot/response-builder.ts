import { buildCopilotActions } from "./actions";
import type {
  CopilotChatResponse,
  CopilotCitation,
  CopilotDocument,
  CopilotIntent,
  CopilotPageContext,
} from "./types";

function citationFromDocument(document: CopilotDocument): CopilotCitation {
  return {
    title: document.title,
    url: document.url,
    sourceType: document.sourceType,
  };
}

function uniqueCitations(documents: CopilotDocument[]): CopilotCitation[] {
  const seen = new Set<string>();
  const citations: CopilotCitation[] = [];

  for (const document of documents) {
    const key = `${document.url}:${document.title}`;
    if (seen.has(key)) continue;
    seen.add(key);
    citations.push(citationFromDocument(document));
  }

  return citations.slice(0, 4);
}

function trimSentence(value: string, maxLength: number): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 3).replace(/\s+\S*$/, "").trim()}...`;
}

function answerForPrivatePractice(): string {
  return "Sign in to let Copilot summarize your private practice activity. Private entries are retrieved live for your account only and are not stored in the public copilot corpus.";
}

function answerForNoContext(): string {
  return "I could not find enough Buddhi Align context for that yet. The support page is the safest place to report a missing answer or site issue.";
}

function buildGroundedAnswer(input: {
  intent: CopilotIntent;
  query: string;
  documents: CopilotDocument[];
  context?: CopilotPageContext;
}): string {
  const [top, second, third] = input.documents;

  if (input.intent === "private_practice") {
    return top?.sourceType === "private_practice_summary"
      ? top.text
      : answerForPrivatePractice();
  }

  if (!top) return answerForNoContext();

  if (input.intent === "navigation") {
    return `The best match is ${top.title}. ${trimSentence(top.summary ?? top.text, 210)}`;
  }

  if (input.intent === "support") {
    return `For support, use ${top.title}. ${trimSentence(top.summary ?? top.text, 240)}`;
  }

  if (input.intent === "community") {
    return `For community questions, start with ${top.title}. ${trimSentence(top.summary ?? top.text, 240)}`;
  }

  if (input.intent === "autograph") {
    return `For Autograph Exchange, the best source is ${top.title}. ${trimSentence(top.summary ?? top.text, 240)}`;
  }

  const supporting = [second, third]
    .filter(Boolean)
    .map((document) => document.title)
    .join(" and ");
  const suffix = supporting ? ` Related sources include ${supporting}.` : "";

  return `${trimSentence(top.summary ?? top.text, 320)}${suffix}`;
}

export function buildCopilotResponse(input: {
  intent: CopilotIntent;
  query: string;
  documents: CopilotDocument[];
  context?: CopilotPageContext;
}): CopilotChatResponse {
  const answer = buildGroundedAnswer(input);
  const citations = uniqueCitations(input.documents);
  const actions = buildCopilotActions({
    intent: input.intent,
    documents: input.documents,
    query: input.query,
    context: input.context,
  });

  const confidence = input.intent === "private_practice"
    ? "medium"
    : input.documents.length >= 2
      ? "high"
      : input.documents.length === 1
        ? "medium"
        : "low";

  return {
    answer,
    citations,
    actions,
    confidence,
  };
}
