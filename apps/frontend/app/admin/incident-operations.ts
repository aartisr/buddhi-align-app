import type { ObservabilityAlert } from "@/app/lib/observability-summary";

export type IncidentFilter = "open" | "all";

export interface AdminIncidentLike {
  id?: string;
  title?: string;
  severity?: "info" | "warning" | "critical";
  status?: string;
  note?: string;
  alertKey?: string;
  createdBy?: string;
  createdAt?: string;
  resolvedAt?: string;
  [key: string]: unknown;
}

export interface IncidentStatsResult<TIncident> {
  openCount: number;
  resolvedCount: number;
  visibleIncidents: TIncident[];
}

export function resolveIncidentFilter(value?: string): IncidentFilter {
  if (value === "all") return "all";
  return "open";
}

export function deriveIncidentStats<TIncident extends AdminIncidentLike>(
  incidents: TIncident[],
  filter: IncidentFilter,
): IncidentStatsResult<TIncident> {
  const openIncidents: TIncident[] = [];
  const resolvedIncidents: TIncident[] = [];

  for (const incident of incidents) {
    if ((incident.status ?? "open") === "resolved") {
      resolvedIncidents.push(incident);
    } else {
      openIncidents.push(incident);
    }
  }

  return {
    openCount: openIncidents.length,
    resolvedCount: resolvedIncidents.length,
    visibleIncidents: filter === "all" ? incidents : openIncidents,
  };
}

export interface SyncCriticalAlertIncidentsOptions<TIncident extends AdminIncidentLike> {
  incidents: TIncident[];
  criticalAlerts: ObservabilityAlert[];
  createIncident: (incident: TIncident) => Promise<void>;
  writeAutoAudit: (alertKey: string, at: string) => Promise<void>;
  now?: () => string;
  id?: () => string;
}

export async function syncCriticalAlertIncidents<TIncident extends AdminIncidentLike>(
  options: SyncCriticalAlertIncidentsOptions<TIncident>,
): Promise<TIncident[]> {
  const openIncidentAlertKeys = new Set(
    options.incidents
      .filter((incident) => (incident.status ?? "open") !== "resolved")
      .map((incident) => (typeof incident.alertKey === "string" ? incident.alertKey : undefined))
      .filter((key): key is string => Boolean(key)),
  );

  const now = options.now ?? (() => new Date().toISOString());
  const id = options.id ?? (() => crypto.randomUUID());

  const candidates = options.criticalAlerts.filter((alert) => !openIncidentAlertKeys.has(alert.key));

  const created = await Promise.all(
    candidates.map(async (alert) => {
      const createdAt = now();
      const incident = {
        id: id(),
        title: `[AUTO] ${alert.title}`,
        severity: "critical",
        status: "open",
        note: `${alert.detail} Owner: ${alert.owner}. Runbook: ${alert.runbook}.`,
        alertKey: alert.key,
        createdBy: "system:observability",
        createdAt,
      } as TIncident;

      try {
        await options.createIncident(incident);
        await options.writeAutoAudit(alert.key, createdAt);
        return incident;
      } catch {
        // Observability auto-ticketing should be non-blocking.
        return null;
      }
    }),
  );

  const persisted: TIncident[] = [];
  for (const incident of created) {
    if (incident) {
      persisted.push(incident as TIncident);
    }
  }
  return persisted;
}
