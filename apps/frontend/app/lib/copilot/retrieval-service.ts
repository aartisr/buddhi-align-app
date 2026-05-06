import { classifyCopilotIntent, sourceTypesForIntent } from "./query-classifier";
import { LocalCopilotRetrievalProvider } from "./local-retrieval-provider";
import { createConfiguredHostedRetrievalProvider } from "./openai-vector-store-provider";
import { DynamicCopilotSourceProvider } from "./dynamic-source-provider";
import { buildGuardrailResponse, detectCopilotGuardrail } from "./guardrails";
import { buildPrivatePracticeDocuments } from "./private-practice-provider";
import { buildCopilotResponse } from "./response-builder";
import type { CopilotAction, CopilotChatResponse, CopilotDocument, CopilotPageContext, CopilotRetrievalProvider, CopilotRetrievalQuery } from "./types";

const DEFAULT_RESULT_LIMIT = 6;

const localProvider = new LocalCopilotRetrievalProvider();
const dynamicProvider = new DynamicCopilotSourceProvider();
let hostedProvider: CopilotRetrievalProvider | null | undefined;

function normalizePath(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const path = value.split("?")[0]?.split("#")[0] ?? value;
  return path === "/" ? "/" : path.replace(/\/$/, "");
}

export async function answerCopilotQuestion(input: {
  query: string;
  context?: CopilotPageContext;
  userId?: string;
  provider?: CopilotRetrievalProvider;
}): Promise<CopilotChatResponse> {
  const guardrail = detectCopilotGuardrail(input.query);
  if (guardrail) {
    return buildGuardrailResponse(guardrail);
  }

  const intent = classifyCopilotIntent(input.query);
  if (intent === "private_practice") {
    return answerPrivatePracticeQuestion(input.userId, input.context);
  }

  const retrievalQuery: CopilotRetrievalQuery = {
    query: input.query,
    currentPath: normalizePath(input.context?.path),
    moduleKey: input.context?.moduleKey,
    sourceTypes: sourceTypesForIntent(intent),
    limit: DEFAULT_RESULT_LIMIT,
  };
  const documents = await retrieveWithFallback(retrievalQuery, input.provider);

  return buildCopilotResponse({
    intent,
    query: input.query,
    documents,
    context: input.context,
  });
}

async function answerPrivatePracticeQuestion(
  userId: string | undefined,
  context?: CopilotPageContext,
): Promise<CopilotChatResponse> {
  if (!userId) {
    return {
      answer: "Sign in to let Copilot summarize your private practice activity. Private entries are retrieved live for your account only and are not stored in the public copilot corpus.",
      citations: [],
      actions: [buildSignInAction(context?.path)],
      confidence: "medium",
    };
  }

  const documents = await buildPrivatePracticeDocuments(userId);
  return buildCopilotResponse({
    intent: "private_practice",
    query: "private practice summary",
    documents,
    context,
  });
}

function buildSignInAction(path: string | undefined): CopilotAction {
  const callbackUrl = encodeURIComponent(path?.startsWith("/") ? path : "/motivation-analytics");
  return {
    type: "navigate",
    label: "Sign In",
    href: `/sign-in?callbackUrl=${callbackUrl}`,
  };
}

async function retrieveWithFallback(
  query: CopilotRetrievalQuery,
  overrideProvider?: CopilotRetrievalProvider,
): Promise<CopilotDocument[]> {
  if (overrideProvider) {
    return overrideProvider.search(query);
  }

  hostedProvider ??= createConfiguredHostedRetrievalProvider();

  if (hostedProvider) {
    try {
      const hostedDocuments = await hostedProvider.search(query);
      if (hostedDocuments.length > 0) return hostedDocuments;
    } catch {
      // Fall back to the local corpus to keep the copilot resilient.
    }
  }

  const [localDocuments, dynamicDocuments] = await Promise.all([
    localProvider.search(query),
    dynamicProvider.search(query),
  ]);
  return mergeDocuments(dynamicDocuments, localDocuments).slice(0, query.limit);
}

function mergeDocuments(primary: CopilotDocument[], secondary: CopilotDocument[]): CopilotDocument[] {
  const seen = new Set<string>();
  const merged: CopilotDocument[] = [];

  for (const document of [...primary, ...secondary]) {
    const key = `${document.url}:${document.title}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(document);
  }

  return merged;
}
