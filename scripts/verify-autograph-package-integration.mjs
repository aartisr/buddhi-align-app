import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const FRONTEND_PACKAGE_JSON = path.join(ROOT, "apps/frontend/package.json");
const SOURCE_ROOT = path.join(ROOT, "apps/frontend/app");
const REQUIRED_PACKAGES = [
  "@aartisr/autograph-contract",
  "@aartisr/autograph-core",
  "@aartisr/autograph-feature",
];

function fail(message) {
  console.error(`[autograph-package-check] ${message}`);
}

function pass(message) {
  console.log(`[autograph-package-check] ${message}`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function walkFiles(dir, found = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith(".")) {
      continue;
    }

    const absolutePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist" || entry.name === ".next") {
        continue;
      }

      walkFiles(absolutePath, found);
      continue;
    }

    if (/\.(ts|tsx|js|jsx|css|mjs)$/.test(entry.name)) {
      found.push(absolutePath);
    }
  }

  return found;
}

function toRepoPath(absolutePath) {
  return path.relative(ROOT, absolutePath).replace(/\\/g, "/");
}

function validateDependencies() {
  const pkg = readJson(FRONTEND_PACKAGE_JSON);
  const dependencies = pkg.dependencies || {};
  const errors = [];
  const allowedFilePrefix = "file:../../external/autograph-exchange/packages/";

  for (const packageName of REQUIRED_PACKAGES) {
    const declared = dependencies[packageName];
    if (!declared) {
      errors.push(`Missing dependency ${packageName} in apps/frontend/package.json.`);
      continue;
    }

    if (declared.startsWith("file:")) {
      if (!declared.startsWith(allowedFilePrefix)) {
        errors.push(`Dependency ${packageName} uses unsupported local source ${declared}.`);
      }

      continue;
    }

    if (declared.startsWith("link:") || declared.startsWith("workspace:") || declared.startsWith("../") || declared.startsWith("./")) {
      errors.push(`Dependency ${packageName} must use approved source (public version/tag or external GitHub mirror), found ${declared}.`);
    }
  }

  return errors;
}

function validateNoLocalSourceCoupling() {
  const files = walkFiles(SOURCE_ROOT);
  const errors = [];
  const bannedSnippets = [
    "external/autograph-exchange",
    "../external/autograph-exchange",
    "../../external/autograph-exchange",
    "../../../external/autograph-exchange",
    "../../../../external/autograph-exchange",
    "packages/autograph-feature",
    "packages/autograph-core",
    "packages/autograph-contract",
  ];

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, "utf8");

    for (const snippet of bannedSnippets) {
      if (content.includes(snippet)) {
        errors.push(`Found local coupling snippet '${snippet}' in ${toRepoPath(filePath)}.`);
      }
    }
  }

  return errors;
}

function main() {
  const errors = [
    ...validateDependencies(),
    ...validateNoLocalSourceCoupling(),
  ];

  if (errors.length > 0) {
    for (const error of errors) {
      fail(error);
    }

    process.exit(1);
  }

  pass("Autograph integration is generic and package-based.");
}

main();
