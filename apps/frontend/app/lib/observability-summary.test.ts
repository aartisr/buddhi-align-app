import { describe, expect, it } from "vitest";

import type { ObservabilityEventEntry } from "./server-observability";
import { buildObservabilitySummary } from "./observability-summary";

function makeEvent(overrides: Partial<ObservabilityEventEntry>): ObservabilityEventEntry {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    at: overrides.at ?? new Date().toISOString(),
    event: overrides.event ?? "analytics_fetch_success",
    source: overrides.source ?? "server",
    severity: overrides.severity ?? "info",
    ...overrides,
  };
}

describe("buildObservabilitySummary", () => {
  it("classifies recent auth denials, import issues, and personalization issues", () => {
    const now = Date.parse("2026-04-09T18:00:00.000Z");
    const events = [
      makeEvent({ at: "2026-04-09T10:00:00.000Z", event: "admin_api_oidc_required_denied" }),
      makeEvent({ at: "2026-04-09T11:00:00.000Z", event: "admin_api_stepup_required_denied" }),
      makeEvent({ at: "2026-04-09T12:00:00.000Z", event: "data_import_invalid_json" }),
      makeEvent({ at: "2026-04-09T13:00:00.000Z", event: "personalization_recommendations_empty" }),
      makeEvent({ at: "2026-04-09T14:00:00.000Z", event: "copilot_answer_completed" }),
      makeEvent({ at: "2026-04-09T15:00:00.000Z", event: "copilot_guardrail_triggered" }),
      makeEvent({ at: "2026-04-07T13:00:00.000Z", event: "admin_api_forbidden" }),
    ];

    const summary = buildObservabilitySummary(events, now);

    expect(summary.last24hEvents).toBe(6);
    expect(summary.authDenials24h).toBe(2);
    expect(summary.importIssues24h).toBe(1);
    expect(summary.personalizationIssues24h).toBe(1);
    expect(summary.copilotAnswers24h).toBe(1);
    expect(summary.copilotFailures24h).toBe(0);
    expect(summary.copilotGuardrails24h).toBe(1);
    expect(summary.weeklyAuthDenials).toHaveLength(7);
    expect(summary.weeklyImportIssues).toHaveLength(7);
  });

  it("raises warning and critical alerts at configured thresholds", () => {
    const now = Date.parse("2026-04-09T18:00:00.000Z");
    process.env.OBS_ALERT_AUTH_DENIALS_WARN = "2";
    process.env.OBS_ALERT_AUTH_DENIALS_CRITICAL = "3";
    process.env.OBS_ALERT_IMPORT_ISSUES_WARN = "1";
    process.env.OBS_ALERT_IMPORT_ISSUES_CRITICAL = "2";
    process.env.OBS_ALERT_COPILOT_FAILURES_WARN = "1";
    process.env.OBS_ALERT_COPILOT_FAILURES_CRITICAL = "2";

    const events = [
      makeEvent({ at: "2026-04-09T10:00:00.000Z", event: "admin_api_unauthorized" }),
      makeEvent({ at: "2026-04-09T11:00:00.000Z", event: "admin_api_forbidden" }),
      makeEvent({ at: "2026-04-09T12:00:00.000Z", event: "admin_api_stepup_required_denied" }),
      makeEvent({ at: "2026-04-09T13:00:00.000Z", event: "data_import_invalid_archive" }),
      makeEvent({ at: "2026-04-09T14:00:00.000Z", event: "data_import_invalid_json" }),
      makeEvent({ at: "2026-04-09T15:00:00.000Z", event: "copilot_answer_failed" }),
      makeEvent({ at: "2026-04-09T16:00:00.000Z", event: "copilot_answer_failed" }),
    ];

    const summary = buildObservabilitySummary(events, now);

    expect(summary.alerts.some((alert) => alert.title === "Auth denial spike" && alert.level === "critical")).toBe(true);
    expect(summary.alerts.some((alert) => alert.title === "Data import instability" && alert.level === "critical")).toBe(true);
    expect(summary.alerts.some((alert) => alert.title === "Copilot unavailable" && alert.level === "critical")).toBe(true);
    expect(summary.alerts.some((alert) => alert.category === "auth" && alert.owner === "Identity & Access")).toBe(true);
    expect(summary.alerts.some((alert) => alert.runbook === "RB-OBS-DATA-02")).toBe(true);
    expect(summary.alerts.some((alert) => alert.runbook === "RB-OBS-COPILOT-04")).toBe(true);

    const latestAuthTrend = summary.weeklyAuthDenials.at(-1);
    const latestImportTrend = summary.weeklyImportIssues.at(-1);
    expect(latestAuthTrend?.count).toBe(3);
    expect(latestImportTrend?.count).toBe(2);

    delete process.env.OBS_ALERT_AUTH_DENIALS_WARN;
    delete process.env.OBS_ALERT_AUTH_DENIALS_CRITICAL;
    delete process.env.OBS_ALERT_IMPORT_ISSUES_WARN;
    delete process.env.OBS_ALERT_IMPORT_ISSUES_CRITICAL;
    delete process.env.OBS_ALERT_COPILOT_FAILURES_WARN;
    delete process.env.OBS_ALERT_COPILOT_FAILURES_CRITICAL;
  });
});
