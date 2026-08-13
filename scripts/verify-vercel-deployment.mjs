import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const packageJsonPath = resolve(root, "package.json");
const vercelConfigPath = resolve(root, "vercel.json");
const nestedVercelConfigPath = resolve(root, "apps/frontend/vercel.json");
const requiredNodeMajor = "24";

function fail(message) {
  console.error(`[vercel-preflight] ${message}`);
  process.exitCode = 1;
}

if (!existsSync(packageJsonPath) || !existsSync(vercelConfigPath)) {
  fail("Run this command from the repository root, where package.json and vercel.json are present.");
} else {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
  const vercelConfig = JSON.parse(readFileSync(vercelConfigPath, "utf8"));

  if (packageJson.engines?.node !== `${requiredNodeMajor}.x`) {
    fail(`package.json must pin the Vercel runtime to Node.js "${requiredNodeMajor}.x".`);
  }

  if (vercelConfig.framework !== "nextjs") {
    fail('vercel.json must explicitly declare the "nextjs" framework.');
  }

  if (vercelConfig.installCommand !== "node scripts/vercel-install.mjs") {
    fail("vercel.json must use the workspace-safe install command.");
  }

  if (!vercelConfig.buildCommand?.includes("npm run vercel:preflight")) {
    fail("vercel.json buildCommand must execute the Vercel preflight check.");
  }

  if (existsSync(nestedVercelConfigPath)) {
    fail("apps/frontend/vercel.json must not exist: Vercel must build from the repository root.");
  }
}

if (process.env.VERCEL === "1" && process.versions.node.split(".")[0] !== requiredNodeMajor) {
  fail(`Vercel is running Node.js ${process.version}; this project requires Node.js ${requiredNodeMajor}.x.`);
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("[vercel-preflight] Root workspace, Next.js framework, and Node.js runtime are deployment-ready.");
