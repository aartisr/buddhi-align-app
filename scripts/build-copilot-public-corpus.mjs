#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createJiti } from "jiti";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const frontendRoot = path.join(repoRoot, "apps", "frontend");
const defaultOutputPath = path.join(frontendRoot, "public", "copilot", "public-corpus.json");

function parseArgs(argv) {
  const args = new Map();

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) continue;

    const key = arg.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      args.set(key, "1");
      continue;
    }

    args.set(key, next);
    index += 1;
  }

  return {
    outputPath: path.resolve(repoRoot, args.get("out") ?? defaultOutputPath),
    pretty: args.get("pretty") !== "0",
  };
}

function stableDocumentHash(document) {
  const content = [
    document.id,
    document.sourceType,
    document.title,
    document.url,
    document.summary,
    document.moduleKey,
    document.lastModified,
    document.text,
  ].filter(Boolean).join("\n");

  return createHash("sha256").update(content).digest("hex");
}

function buildStats(documents) {
  const bySourceType = documents.reduce((acc, document) => {
    acc[document.sourceType] = (acc[document.sourceType] ?? 0) + 1;
    return acc;
  }, {});

  return {
    documents: documents.length,
    bySourceType,
    bytes: Buffer.byteLength(JSON.stringify(documents), "utf8"),
  };
}

export async function buildCorpusArtifact() {
  const jiti = createJiti(import.meta.url, {
    alias: {
      "@": frontendRoot,
    },
  });
  const { buildPublicCopilotCorpus } = await jiti.import(
    pathToFileURL(path.join(frontendRoot, "app", "lib", "copilot", "public-corpus.ts")).href,
  );
  const documents = await buildPublicCopilotCorpus();
  const normalizedDocuments = documents.map((document) => ({
    ...document,
    contentHash: stableDocumentHash(document),
  }));

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    stats: buildStats(normalizedDocuments),
    documents: normalizedDocuments,
  };
}

export async function writeCorpusArtifact(options = {}) {
  const outputPath = options.outputPath ?? defaultOutputPath;
  const artifact = await buildCorpusArtifact();
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(artifact, null, options.pretty === false ? 0 : 2)}\n`, "utf8");
  return { artifact, outputPath };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const { artifact, outputPath } = await writeCorpusArtifact(options);
  console.log(`[copilot:corpus] wrote ${artifact.stats.documents} documents to ${path.relative(repoRoot, outputPath)}`);
  console.log(`[copilot:corpus] source types: ${Object.entries(artifact.stats.bySourceType).map(([key, value]) => `${key}=${value}`).join(", ")}`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error("[copilot:corpus] failed", error);
    process.exitCode = 1;
  });
}
