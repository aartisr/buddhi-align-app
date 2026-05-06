import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

import { recordObservabilityEvent } from "@/app/lib/server-observability";
import { detectCopilotGuardrail } from "@/app/lib/copilot/guardrails";
import { answerCopilotQuestion } from "@/app/lib/copilot/retrieval-service";
import { classifyCopilotIntent } from "@/app/lib/copilot/query-classifier";
import type { CopilotChatMessage, CopilotChatRequest } from "@/app/lib/copilot/types";

export const runtime = "nodejs";

const MAX_MESSAGE_LENGTH = 1200;
const MAX_MESSAGES = 12;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseRequestBody(value: unknown): { ok: true; data: CopilotChatRequest } | { ok: false; error: string } {
  if (!isObject(value)) {
    return { ok: false, error: "Request body must be an object." };
  }

  const messages = value.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return { ok: false, error: "At least one message is required." };
  }

  const parsedMessages: CopilotChatMessage[] = messages.slice(-MAX_MESSAGES).flatMap((message) => {
    if (!isObject(message)) return [];
    const role = message.role;
    const content = message.content;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return [];
    return [{ role, content: content.slice(0, MAX_MESSAGE_LENGTH) } satisfies CopilotChatMessage];
  });

  if (parsedMessages.length === 0) {
    return { ok: false, error: "No valid chat messages were provided." };
  }

  const context = isObject(value.context)
    ? {
        path: typeof value.context.path === "string" ? value.context.path.slice(0, 240) : undefined,
        locale: typeof value.context.locale === "string" ? value.context.locale.slice(0, 16) : undefined,
        moduleKey: typeof value.context.moduleKey === "string" ? value.context.moduleKey.slice(0, 48) : undefined,
      }
    : undefined;

  return {
    ok: true,
    data: {
      messages: parsedMessages,
      context,
    },
  };
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const startedAt = Date.now();
  let rawBody: unknown;

  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = parseRequestBody(rawBody);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const latestUserMessage = [...parsed.data.messages].reverse().find((message) => message.role === "user");
  if (!latestUserMessage?.content.trim()) {
    return NextResponse.json({ error: "A user message is required." }, { status: 400 });
  }

  try {
    const intent = classifyCopilotIntent(latestUserMessage.content);
    const guardrail = detectCopilotGuardrail(latestUserMessage.content);
    const session = intent === "private_practice" ? await auth() : null;
    const response = await answerCopilotQuestion({
      query: latestUserMessage.content,
      context: parsed.data.context,
      userId: session?.user?.id,
    });

    await recordObservabilityEvent({
      event: guardrail ? "copilot_guardrail_triggered" : "copilot_answer_completed",
      source: "server",
      statusCode: 200,
      data: {
        latencyMs: Date.now() - startedAt,
        citations: response.citations.length,
        actions: response.actions.length,
        confidence: response.confidence,
        guardrail: guardrail?.kind,
        path: parsed.data.context?.path,
      },
    });

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    await recordObservabilityEvent({
      event: "copilot_answer_failed",
      source: "server",
      severity: "warning",
      statusCode: 500,
      data: {
        latencyMs: Date.now() - startedAt,
        path: parsed.data.context?.path,
      },
    });

    return NextResponse.json({ error: "Copilot is temporarily unavailable." }, { status: 500 });
  }
}
