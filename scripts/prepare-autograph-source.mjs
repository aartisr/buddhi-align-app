import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import os from "node:os";

const ROOT = process.cwd();
const TARGET_DIR = path.join(ROOT, "external/autograph-exchange");
const DEFAULT_REPO_URL = "https://github.com/aartisr/autograph-exchange.git";
const DEFAULT_REF = "main";

function isDefaultPublicRepo(repoUrl) {
  const normalized = repoUrl.replace(/\.git$/i, "");
  return normalized === "https://github.com/aartisr/autograph-exchange";
}

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

function ensureDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
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

function prepareFromGitClone(repoUrl, ref) {
  execFileSync("git", ["clone", "--depth=1", "--branch", ref, repoUrl, TARGET_DIR], {
    stdio: "inherit",
  });
}

function prepareFromGithubTarball(ref) {
  const tarballUrl = `https://codeload.github.com/aartisr/autograph-exchange/tar.gz/refs/heads/${encodeURIComponent(ref)}`;
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "autograph-source-"));
  const tarballPath = path.join(tempRoot, "source.tar.gz");
  const extractDir = path.join(tempRoot, "extract");

  ensureDirectory(extractDir);
  ensureDirectory(path.dirname(TARGET_DIR));

  execFileSync("curl", ["-fsSL", tarballUrl, "-o", tarballPath], {
    stdio: "inherit",
  });

  execFileSync("tar", ["-xzf", tarballPath, "-C", extractDir], {
    stdio: "inherit",
  });

  const extractedRoot = fs.readdirSync(extractDir, { withFileTypes: true })
    .find((entry) => entry.isDirectory());

  if (!extractedRoot) {
    throw new Error("Tarball extraction failed: missing root directory.");
  }

  fs.renameSync(path.join(extractDir, extractedRoot.name), TARGET_DIR);
  fs.rmSync(tempRoot, { recursive: true, force: true });
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

  try {
    prepareFromGitClone(repoUrl, ref);
  } catch (error) {
    if (!isDefaultPublicRepo(repoUrl)) {
      throw error;
    }

    console.warn("[autograph-source] git clone failed, falling back to GitHub tarball download.");
    ensureDirectoryRemoved(TARGET_DIR);
    prepareFromGithubTarball(ref);
  }

  validateSourceTree(TARGET_DIR);
  console.log("[autograph-source] Source prepared successfully.");
}

main();
