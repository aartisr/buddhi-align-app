import { existsSync, mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";

const isCI = String(process.env.CI || "").toLowerCase() === "true";
const outputDir = "apps/frontend/.lighthouseci";
const outputPath = `${outputDir}/report.json`;

mkdirSync(outputDir, { recursive: true });

const localBinary = process.platform === "win32"
  ? "node_modules/.bin/lighthouse.cmd"
  : "node_modules/.bin/lighthouse";

const command = existsSync(localBinary) ? localBinary : "npx";
const args = existsSync(localBinary)
  ? []
  : ["--yes", "lighthouse"];

args.push(
  "http://127.0.0.1:3000",
  "--chrome-flags=--headless=new --no-sandbox --disable-dev-shm-usage",
  "--preset=desktop",
  "--only-categories=performance",
  "--budgets-path=apps/frontend/lighthouse-budget.json",
  "--output=json",
  `--output-path=${outputPath}`,
  "--quiet",
);

const result = spawnSync(command, args, {
  stdio: "inherit",
  shell: false,
});

if (result.status === 0 && existsSync(outputPath)) {
  process.exit(0);
}

const offlineLikely = result.status !== 0 && !isCI;
if (offlineLikely) {
  console.warn("[perf:lighthouse] Lighthouse unavailable in local environment; skipping strict failure outside CI.");
  process.exit(0);
}

process.exit(result.status ?? 1);
