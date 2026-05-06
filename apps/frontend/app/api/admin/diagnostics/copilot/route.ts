import { NextResponse } from "next/server";

import { buildPublicCopilotCorpus } from "@/app/lib/copilot/public-corpus";
import { LocalCopilotRetrievalProvider } from "@/app/lib/copilot/local-retrieval-provider";
import { createConfiguredHostedRetrievalProvider } from "@/app/lib/copilot/openai-vector-store-provider";
import { requireAdminApiAccess } from "../../_auth";

type ProbeStatus = {
  ok: boolean;
  latencyMs?: number;
  resultCount?: number;
  error?: string;
};

type RuntimeConfig = {
  mode: string;
  enabled: boolean;
  hostedConfigured: boolean;
};

type Findings = {
  issues: string[];
  warnings: string[];
};

type CorpusCheck = {
  ok: boolean;
  documentCount: number;
  error?: string;
};

function elapsedMs(startedAt: number): number {
  return Math.max(0, Date.now() - startedAt);
}

function providerMode(): string {
  return (process.env.COPILOT_PROVIDER ?? "local").trim().toLowerCase() || "local";
}

function isCopilotEnabled(): boolean {
  return process.env.NEXT_PUBLIC_COPILOT_ENABLED !== "0";
}

function isHostedConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_COPILOT_VECTOR_STORE_ID);
}

function getRuntimeConfig(): RuntimeConfig {
  return {
    mode: providerMode(),
    enabled: isCopilotEnabled(),
    hostedConfigured: isHostedConfigured(),
  };
}

function configurationFindings(runtime: RuntimeConfig): Findings {
  const issues: string[] = [];
  const warnings: string[] = [];

  if (!runtime.enabled) {
    warnings.push("NEXT_PUBLIC_COPILOT_ENABLED is set to 0.");
  }

  if (runtime.mode === "openai-vector-store" && !runtime.hostedConfigured) {
    issues.push("COPILOT_PROVIDER is openai-vector-store but OpenAI credentials or vector store ID are missing.");
  }

  return { issues, warnings };
}

async function buildCorpusCheck(): Promise<{ check: CorpusCheck; findings: Findings }> {
  try {
    const corpus = await buildPublicCopilotCorpus();
    const warning = corpus.length < 40
      ? `Public copilot corpus has ${corpus.length} documents; expected at least 40.`
      : null;

    return {
      check: { ok: corpus.length > 0, documentCount: corpus.length },
      findings: { issues: [], warnings: warning ? [warning] : [] },
    };
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown corpus build error";
    return {
      check: { ok: false, documentCount: 0, error: detail },
      findings: { issues: [`Public copilot corpus build failed: ${detail}`], warnings: [] },
    };
  }
}

async function runLocalProbe(): Promise<ProbeStatus> {
  const startedAt = Date.now();
  try {
    const provider = new LocalCopilotRetrievalProvider();
    const results = await provider.search({
      query: "What is Buddhi Align?",
      limit: 3,
    });

    return {
      ok: results.length > 0,
      latencyMs: elapsedMs(startedAt),
      resultCount: results.length,
      ...(results.length === 0 ? { error: "Local retrieval returned no results." } : {}),
    };
  } catch (error) {
    return {
      ok: false,
      latencyMs: elapsedMs(startedAt),
      error: error instanceof Error ? error.message : "Unknown local retrieval error",
    };
  }
}

async function runHostedProbe(configured: boolean): Promise<ProbeStatus & { configured: boolean }> {
  if (!configured) {
    return { configured, ok: false };
  }

  const startedAt = Date.now();
  try {
    const provider = createConfiguredHostedRetrievalProvider();
    if (!provider) {
      return {
        configured,
        ok: false,
        latencyMs: elapsedMs(startedAt),
        error: "Hosted retrieval provider could not be initialized.",
      };
    }

    const results = await provider.search({
      query: "What is Buddhi Align?",
      limit: 2,
    });

    return {
      configured,
      ok: results.length > 0,
      latencyMs: elapsedMs(startedAt),
      resultCount: results.length,
      ...(results.length === 0 ? { error: "Hosted retrieval returned no results." } : {}),
    };
  } catch (error) {
    return {
      configured,
      ok: false,
      latencyMs: elapsedMs(startedAt),
      error: error instanceof Error ? error.message : "Unknown hosted retrieval error",
    };
  }
}

function retrievalFindings(
  runtime: RuntimeConfig,
  localProbe: ProbeStatus,
  hostedProbe: ProbeStatus & { configured: boolean },
): Findings {
  const issues: string[] = [];
  const warnings: string[] = [];

  if (!localProbe.ok) {
    issues.push(localProbe.error ?? "Local copilot retrieval probe failed.");
  }

  if (runtime.mode === "openai-vector-store" && runtime.hostedConfigured && !hostedProbe.ok) {
    issues.push(hostedProbe.error ?? "Hosted copilot retrieval probe failed.");
  } else if (runtime.hostedConfigured && !hostedProbe.ok) {
    warnings.push(hostedProbe.error ?? "Hosted copilot retrieval probe failed.");
  }

  return { issues, warnings };
}

function mergeFindings(...items: Findings[]): Findings {
  return {
    issues: items.flatMap((item) => item.issues),
    warnings: items.flatMap((item) => item.warnings),
  };
}

export async function GET() {
  const authResult = await requireAdminApiAccess();
  if (!authResult.ok) return authResult.response;

  const runtime = getRuntimeConfig();
  const configFindings = configurationFindings(runtime);
  const { check: corpusCheck, findings: corpusFindings } = await buildCorpusCheck();

  const [localProbe, hostedProbe] = await Promise.all([
    runLocalProbe(),
    runHostedProbe(runtime.hostedConfigured),
  ]);
  const retrievalIssues = retrievalFindings(runtime, localProbe, hostedProbe);
  const findings = mergeFindings(configFindings, corpusFindings, retrievalIssues);

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    userId: authResult.userId,
    runtime: {
      provider: runtime.mode,
      enabled: runtime.enabled,
      hostedConfigured: runtime.hostedConfigured,
      maxRetrievalMs: process.env.COPILOT_MAX_RETRIEVAL_MS ?? null,
    },
    checks: {
      localCorpus: corpusCheck,
      localRetrieval: localProbe,
      hostedRetrieval: hostedProbe,
    },
    summary: {
      ok: findings.issues.length === 0,
      issues: findings.issues,
      warnings: findings.warnings,
    },
  });
}
