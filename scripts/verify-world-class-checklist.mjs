import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const REQUIRED_FILES = [
  "docs/elite-quality-scorecard.md",
  "docs/world-class-certification-checklist.md",
  "apps/frontend/lighthouse-budget.json",
  "apps/frontend/.eslintrc.json",
  "apps/frontend/docs/oidc-hardening-checklist.md",
  "apps/frontend/docs/component-engineering-standards.md",
  ".github/workflows/ci.yml",
];

function fail(message) {
  console.error(`[worldclass-check] ${message}`);
}

function checkFileExists(filePath) {
  const absolutePath = path.join(ROOT, filePath);
  return fs.existsSync(absolutePath);
}

function checkEslintPolicy() {
  const eslintPath = path.join(ROOT, "apps/frontend/.eslintrc.json");
  const raw = fs.readFileSync(eslintPath, "utf8");
  const config = JSON.parse(raw);
  const appOverride = (config.overrides || []).find((item) => Array.isArray(item.files) && item.files.includes("app/**/*.{ts,tsx}"));

  if (!appOverride) {
    return "Missing strict app override for app/**/*.{ts,tsx}.";
  }

  const rules = appOverride.rules || {};
  const expected = [
    ["complexity", "error"],
    ["max-depth", "error"],
    ["max-lines-per-function", "error"],
    ["no-implicit-coercion", "error"],
    ["no-else-return", "error"],
  ];

  for (const [ruleName, expectedLevel] of expected) {
    const ruleValue = rules[ruleName];
    if (!ruleValue) {
      return `Missing required rule ${ruleName}.`;
    }

    const actualLevel = Array.isArray(ruleValue) ? ruleValue[0] : ruleValue;
    if (actualLevel !== expectedLevel) {
      return `Rule ${ruleName} must be ${expectedLevel} (found ${String(actualLevel)}).`;
    }
  }

  return null;
}

function checkCiWorkflow() {
  const workflowPath = path.join(ROOT, ".github/workflows/ci.yml");
  const content = fs.readFileSync(workflowPath, "utf8");
  const requiredSnippets = [
    "name: CI/CD Quality Gates",
    "quality:",
    "performance:",
    "security-audit:",
    "TypeScript type-check",
    "npm run perf:ci",
  ];

  for (const snippet of requiredSnippets) {
    if (!content.includes(snippet)) {
      return `CI workflow missing required section: ${snippet}`;
    }
  }

  return null;
}

const errors = [];

for (const filePath of REQUIRED_FILES) {
  if (!checkFileExists(filePath)) {
    errors.push(`Required file not found: ${filePath}`);
  }
}

if (errors.length === 0) {
  const lintError = checkEslintPolicy();
  if (lintError) {
    errors.push(lintError);
  }

  const ciError = checkCiWorkflow();
  if (ciError) {
    errors.push(ciError);
  }
}

if (errors.length > 0) {
  for (const error of errors) {
    fail(error);
  }
  process.exit(1);
}

console.log("[worldclass-check] Certification checklist verification passed.");
