import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const TARGET_DIR = path.join(ROOT, "external/autograph-exchange");
const DEFAULT_REPO_URL = "https://github.com/aartisr/autograph-exchange.git";
const DEFAULT_REF = "main";

function resolveRepoUrl() {
  const localOverride = process.env.AUTOGRAPH_EXCHANGE_REPO_URL?.trim();
  if (localOverride) {
    return localOverride;
  }

  return DEFAULT_REPO_URL;
}

function resolveRepoRef() {
  return process.env.AUTOGRAPH_EXCHANGE_REPO_REF?.trim() || DEFAULT_REF;
}

function ensureDirectoryRemoved(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}

function validateSourceTree(rootPath) {
  const required = [
    "packages/autograph-contract/package.json",
    "packages/autograph-core/package.json",
    "packages/autograph-feature/package.json",
  ];

  for (const relative of required) {
    const absolute = path.join(rootPath, relative);
    if (!fs.existsSync(absolute)) {
      throw new Error(`Missing required package source: ${relative}`);
    }
  }
}

function main() {
  const repoUrl = resolveRepoUrl();
  const ref = resolveRepoRef();

  console.log(`[autograph-source] Using repo: ${repoUrl}`);
  console.log(`[autograph-source] Using ref: ${ref}`);

  if (process.env.AUTOGRAPH_EXCHANGE_SKIP_CLONE === "1") {
    console.log("[autograph-source] Skipping clone due to AUTOGRAPH_EXCHANGE_SKIP_CLONE=1");
    return;
  }

  ensureDirectoryRemoved(TARGET_DIR);

  execFileSync("git", ["clone", "--depth=1", "--branch", ref, repoUrl, TARGET_DIR], {
    stdio: "inherit",
  });

  validateSourceTree(TARGET_DIR);
  console.log("[autograph-source] Source prepared successfully.");
}

main();
