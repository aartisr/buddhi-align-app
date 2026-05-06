#!/usr/bin/env node

import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { performance } from "node:perf_hooks";
import { createJiti } from "jiti";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const frontendRoot = path.join(repoRoot, "apps", "frontend");

const smokeQueries = [
  { query: "What is Buddhi Align?", context: { path: "/" } },
  { query: "Where can I plan my intention?", context: { path: "/" } },
  { query: "How do I request an autograph?", context: { path: "/autograph-exchange" } },
  { query: "Where are Bhakti community discussions?", context: { path: "/community" } },
  { query: "Draft a gratitude entry about patience", context: { path: "/bhakti-journal", moduleKey: "bhakti" } },
  { query: "The community page is not loading", context: { path: "/community" } },
];

function percentile(values, p) {
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[index] ?? 0;
}

async function main() {
  const maxP95Ms = Number(process.env.COPILOT_PERF_P95_MS ?? 750);
  const maxSingleMs = Number(process.env.COPILOT_PERF_MAX_SINGLE_MS ?? 1200);
  const jiti = createJiti(import.meta.url, {
    alias: {
      "@": frontendRoot,
    },
  });
  const { answerCopilotQuestion } = await jiti.import(
    pathToFileURL(path.join(frontendRoot, "app", "lib", "copilot", "retrieval-service.ts")).href,
  );

  const samples = [];
  for (const item of smokeQueries) {
    const startedAt = performance.now();
    const response = await answerCopilotQuestion(item);
    const latencyMs = performance.now() - startedAt;

    samples.push({ ...item, latencyMs, response });
  }

  const latencies = samples.map((sample) => sample.latencyMs);
  const p95 = percentile(latencies, 95);
  const max = Math.max(...latencies);
  const missingCitations = samples.filter((sample) => sample.response.confidence !== "high" && sample.response.citations.length === 0);

  console.log(`[copilot:perf] queries=${samples.length} p95=${p95.toFixed(1)}ms max=${max.toFixed(1)}ms`);
  for (const sample of samples) {
    console.log(`[copilot:perf] ${sample.latencyMs.toFixed(1)}ms ${sample.query}`);
  }

  if (p95 > maxP95Ms) {
    throw new Error(`Copilot p95 ${p95.toFixed(1)}ms exceeded ${maxP95Ms}ms`);
  }
  if (max > maxSingleMs) {
    throw new Error(`Copilot max ${max.toFixed(1)}ms exceeded ${maxSingleMs}ms`);
  }
  if (missingCitations.length > 1) {
    throw new Error(`Too many low-confidence answers without citations: ${missingCitations.length}`);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error("[copilot:perf] failed", error);
    process.exitCode = 1;
  });
}
