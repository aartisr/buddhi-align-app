import { describe, expect, it, vi } from "vitest";

import type { ObservabilityAlert } from "@/app/lib/observability-summary";
import {
  deriveIncidentStats,
  resolveIncidentFilter,
  syncCriticalAlertIncidents,
  type AdminIncidentLike,
} from "./incident-operations";

describe("incident-operations", () => {
  it("defaults unknown filter to open", () => {
    expect(resolveIncidentFilter(undefined)).toBe("open");
    expect(resolveIncidentFilter("random")).toBe("open");
    expect(resolveIncidentFilter("all")).toBe("all");
  });

  it("derives open/resolved counts and visible incidents", () => {
    const incidents: AdminIncidentLike[] = [
      { id: "1", status: "open" },
      { id: "2", status: "resolved" },
      { id: "3" },
    ];

    const openOnly = deriveIncidentStats(incidents, "open");
    expect(openOnly.openCount).toBe(2);
    expect(openOnly.resolvedCount).toBe(1);
    expect(openOnly.visibleIncidents).toHaveLength(2);

    const all = deriveIncidentStats(incidents, "all");
    expect(all.visibleIncidents).toHaveLength(3);
  });

  it("creates incidents only for missing critical alert keys and keeps failures non-blocking", async () => {
    const incidents: AdminIncidentLike[] = [{ id: "existing", status: "open", alertKey: "auth-denial-spike" }];
    const alerts: ObservabilityAlert[] = [
      {
        key: "auth-denial-spike",
        level: "critical",
        category: "auth",
        title: "Auth denial spike",
        detail: "boom",
        owner: "Identity & Access",
        runbook: "RB-OBS-AUTH-01",
      },
      {
        key: "import-instability",
        level: "critical",
        category: "data",
        title: "Data import instability",
        detail: "boom",
        owner: "Data Platform",
        runbook: "RB-OBS-DATA-02",
      },
    ];

    const createIncident = vi.fn(async (incident: AdminIncidentLike) => {
      if (incident.alertKey === "import-instability") {
        throw new Error("write failed");
      }
    });
    const writeAudit = vi.fn(async () => undefined);

    const created = await syncCriticalAlertIncidents({
      incidents,
      criticalAlerts: alerts,
      createIncident,
      writeAutoAudit: writeAudit,
      now: () => "2026-04-09T00:00:00.000Z",
      id: () => "auto-id",
    });

    expect(createIncident).toHaveBeenCalledTimes(1);
    expect(writeAudit).toHaveBeenCalledTimes(0);
    expect(created).toHaveLength(0);
  });
});
