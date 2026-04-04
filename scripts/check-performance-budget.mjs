import { readFileSync } from "node:fs";

const reportPath = process.argv[2];
if (!reportPath) {
  console.error("Usage: node scripts/check-performance-budget.mjs <lighthouse-report.json>");
  process.exit(1);
}

const report = JSON.parse(readFileSync(reportPath, "utf8"));

const thresholdByAuditId = {
  "largest-contentful-paint": 2500,
  "cumulative-layout-shift": 0.1,
  "interaction-to-next-paint": 200,
  "total-blocking-time": 200,
};

const failures = [];

for (const [auditId, threshold] of Object.entries(thresholdByAuditId)) {
  const audit = report.audits?.[auditId];
  const value = audit?.numericValue;

  if (typeof value !== "number") {
    failures.push(`${auditId}: missing numeric value in report`);
    continue;
  }

  if (value > threshold) {
    failures.push(`${auditId}: ${value.toFixed(2)} > ${threshold}`);
  }
}

if (failures.length > 0) {
  console.error("Performance budget check failed:\n" + failures.map((f) => `- ${f}`).join("\n"));
  process.exit(1);
}

console.log("Performance budget check passed.");
