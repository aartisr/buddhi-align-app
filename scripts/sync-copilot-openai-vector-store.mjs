#!/usr/bin/env node

import { Blob } from "node:buffer";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { writeCorpusArtifact } from "./build-copilot-public-corpus.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultCorpusPath = path.join(repoRoot, "apps", "frontend", "public", "copilot", "public-corpus.json");
const OPENAI_FILES_URL = "https://api.openai.com/v1/files";
const OPENAI_VECTOR_STORES_URL = "https://api.openai.com/v1/vector_stores";

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
    corpusPath: path.resolve(repoRoot, args.get("corpus") ?? defaultCorpusPath),
    dryRun: args.has("dry-run") || process.env.COPILOT_SYNC_DRY_RUN === "1",
    limit: args.has("limit") ? Number(args.get("limit")) : undefined,
    rebuild: args.has("rebuild"),
  };
}

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required unless --dry-run is used.`);
  }
  return value;
}

function clampAttribute(value) {
  if (typeof value === "boolean" || typeof value === "number") return value;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, 512);
}

function buildVectorStoreAttributes(document) {
  const attributes = {
    id: document.id,
    sourceType: document.sourceType,
    title: document.title,
    url: document.url,
    summary: document.summary,
    moduleKey: document.moduleKey,
    visibility: document.visibility,
    lastModified: document.lastModified,
    contentHash: document.contentHash,
  };

  return Object.fromEntries(
    Object.entries(attributes)
      .map(([key, value]) => [key, clampAttribute(value)])
      .filter(([, value]) => value !== undefined)
      .slice(0, 16),
  );
}

function buildDocumentFile(document) {
  return [
    `# ${document.title}`,
    "",
    `URL: ${document.url}`,
    `Source type: ${document.sourceType}`,
    document.moduleKey ? `Module: ${document.moduleKey}` : undefined,
    document.summary ? `Summary: ${document.summary}` : undefined,
    "",
    document.text,
    "",
  ].filter(Boolean).join("\n");
}

async function openaiJsonFetch(url, options) {
  const response = await fetch(url, options);
  const body = await response.text();

  if (!response.ok) {
    throw new Error(`${url} failed with ${response.status}: ${body.slice(0, 400)}`);
  }

  return body ? JSON.parse(body) : {};
}

async function uploadOpenAIFile({ apiKey, document }) {
  const body = new FormData();
  const filename = `${document.id.replace(/[^a-z0-9-]+/gi, "-").slice(0, 80)}.txt`;
  body.set("purpose", "assistants");
  body.set("file", new Blob([buildDocumentFile(document)], { type: "text/plain" }), filename);

  return openaiJsonFetch(OPENAI_FILES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body,
  });
}

async function attachOpenAIFileToVectorStore({ apiKey, vectorStoreId, fileId, document }) {
  return openaiJsonFetch(`${OPENAI_VECTOR_STORES_URL}/${encodeURIComponent(vectorStoreId)}/files`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "OpenAI-Beta": "assistants=v2",
    },
    body: JSON.stringify({
      file_id: fileId,
      attributes: buildVectorStoreAttributes(document),
      chunking_strategy: {
        type: "static",
        static: {
          max_chunk_size_tokens: 800,
          chunk_overlap_tokens: 200,
        },
      },
    }),
  });
}

async function readCorpus(corpusPath) {
  const raw = await readFile(corpusPath, "utf8");
  const artifact = JSON.parse(raw);
  if (!Array.isArray(artifact.documents)) {
    throw new Error(`Invalid copilot corpus at ${corpusPath}`);
  }
  return artifact;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.rebuild) {
    await writeCorpusArtifact({ outputPath: options.corpusPath });
  }

  const artifact = await readCorpus(options.corpusPath);
  const documents = Number.isFinite(options.limit)
    ? artifact.documents.slice(0, Math.max(0, options.limit))
    : artifact.documents;

  if (options.dryRun) {
    console.log(`[copilot:sync-openai] dry run: ${documents.length} documents from ${path.relative(repoRoot, options.corpusPath)}`);
    console.log(`[copilot:sync-openai] first document: ${documents[0]?.id ?? "none"}`);
    return;
  }

  const apiKey = requiredEnv("OPENAI_API_KEY");
  const vectorStoreId = requiredEnv("OPENAI_COPILOT_VECTOR_STORE_ID");

  for (const [index, document] of documents.entries()) {
    const file = await uploadOpenAIFile({ apiKey, document });
    await attachOpenAIFileToVectorStore({
      apiKey,
      vectorStoreId,
      fileId: file.id,
      document,
    });
    console.log(`[copilot:sync-openai] ${index + 1}/${documents.length} synced ${document.id}`);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error("[copilot:sync-openai] failed", error);
    process.exitCode = 1;
  });
}
