import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DISALLOWED_PATTERNS = [
  /git@/i,
  /ssh:\/\//i,
  /git\+ssh:\/\//i,
  /git\+file:/i,
  /\bworkspace:/i,
  /\bfile:\/\//i,
  /dev\.azure\.com/i,
  /visualstudio\.com/i,
  /bitbucket\.org/i,
  /gitlab\.[^\s/]+/i,
  /source\.developers\.google/i,
  /\.corp\b/i,
  /\bcorp\.[a-z0-9.-]+/i,
  /\binternal\.[a-z0-9.-]+/i,
];

const FILES_TO_SCAN = [
  "README.md",
  "vercel.json",
  "apps/frontend/README.md",
  "apps/frontend/package.json",
  "package.json",
  "packages/data-access/package.json",
  "packages/shared-ui/package.json",
  "packages/site-config/package.json",
];

function fail(message) {
  console.error(`[private-repo-check] ${message}`);
}

function pass(message) {
  console.log(`[private-repo-check] ${message}`);
}

function readIfExists(relativePath) {
  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) {
    return null;
  }

  return fs.readFileSync(absolutePath, "utf8");
}

function main() {
  const errors = [];

  for (const relativePath of FILES_TO_SCAN) {
    const content = readIfExists(relativePath);
    if (!content) {
      continue;
    }

    for (const pattern of DISALLOWED_PATTERNS) {
      const match = content.match(pattern);
      if (!match) {
        continue;
      }

      errors.push(`Disallowed reference '${match[0]}' in ${relativePath}.`);
    }
  }

  if (errors.length > 0) {
    for (const error of errors) {
      fail(error);
    }

    process.exit(1);
  }

  pass("No private or corporate repository references detected in deploy-critical files.");
}

main();
