import { spawnSync } from "node:child_process";

const result = spawnSync("npm", ["audit", "--omit=dev", "--audit-level=high"], {
  stdio: "pipe",
  encoding: "utf8",
  env: {
    ...process.env,
    npm_config_loglevel: "warn",
  },
});

const stdout = result.stdout ?? "";
const stderr = result.stderr ?? "";
const combined = `${stdout}\n${stderr}`;

if (stdout.trim()) {
  process.stdout.write(stdout);
}
if (stderr.trim()) {
  process.stderr.write(stderr);
}

if (result.status === 0) {
  console.log("[security-audit] Completed with no high/critical vulnerabilities.");
  process.exit(0);
}

const networkAuditFailure =
  combined.includes("audit endpoint returned an error")
  || combined.includes("ENOTFOUND registry.npmjs.org")
  || combined.includes("ECONNRESET")
  || combined.includes("ETIMEDOUT");

if (networkAuditFailure && process.env.CI !== "true") {
  console.warn("[security-audit] Audit endpoint unavailable in local environment; skipping strict failure outside CI.");
  process.exit(0);
}

process.exit(result.status ?? 1);
