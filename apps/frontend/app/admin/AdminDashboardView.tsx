import type { AdminAuditEntry } from "./_audit";
import type { AppErrorEntry } from "@/app/lib/server-error-log";
import type { ObservabilitySummary } from "@/app/lib/observability-summary";
import type { ObservabilityEventEntry } from "@/app/lib/server-observability";
import type { IncidentFilter } from "./incident-operations";

type BasicEntry = {
  id: string;
  createdAt?: string;
  resolvedAt?: string;
  title?: string;
  severity?: "info" | "warning" | "critical";
  status?: string;
  name?: string;
  metric?: string;
  note?: string;
  alertKey?: string;
  createdBy?: string;
  [key: string]: unknown;
};

type IncidentStats = {
  openCount: number;
  resolvedCount: number;
  visibleIncidents: BasicEntry[];
};

type AdminDashboardProps = {
  actorUserId: string;
  reliabilityScore: number;
  errorBudgetRemaining: number;
  activeExperiments: number;
  totalCount: number;
  observabilitySummary: ObservabilitySummary;
  autoCreatedIncidents: BasicEntry[];
  errorLog: AppErrorEntry[];
  observabilityEvents: ObservabilityEventEntry[];
  practiceCounts: Array<{ module: string; count: number }>;
  audits: AdminAuditEntry[];
  incidentsWithAuto: BasicEntry[];
  incidentFilter: IncidentFilter;
  incidentStats: IncidentStats;
  experiments: BasicEntry[];
  lockAdmin: () => Promise<void>;
  logIncident: (formData: FormData) => Promise<void>;
  createExperiment: (formData: FormData) => Promise<void>;
  resolveIncident: (formData: FormData) => Promise<void>;
};

function formatTimestamp(iso?: string): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function buildSparklinePoints(values: number[], width = 200, height = 56, padding = 6): string {
  if (values.length === 0) return "";

  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = Math.max(1, max - min);
  const stepX = values.length > 1 ? (width - padding * 2) / (values.length - 1) : 0;

  return values
    .map((value, idx) => {
      const x = padding + stepX * idx;
      const normalized = (value - min) / span;
      const y = height - padding - normalized * (height - padding * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function StatCards({
  reliabilityScore,
  errorBudgetRemaining,
  activeExperiments,
  totalCount,
}: {
  reliabilityScore: number;
  errorBudgetRemaining: number;
  activeExperiments: number;
  totalCount: number;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
      <article className="app-record-card">
        <p className="text-xs app-copy-soft uppercase tracking-wide">Reliability Score</p>
        <p className="text-2xl font-bold mt-1">{reliabilityScore}</p>
      </article>
      <article className="app-record-card">
        <p className="text-xs app-copy-soft uppercase tracking-wide">Error Budget Left</p>
        <p className="text-2xl font-bold mt-1">{errorBudgetRemaining}%</p>
      </article>
      <article className="app-record-card">
        <p className="text-xs app-copy-soft uppercase tracking-wide">Active Experiments</p>
        <p className="text-2xl font-bold mt-1">{activeExperiments}</p>
      </article>
      <article className="app-record-card">
        <p className="text-xs app-copy-soft uppercase tracking-wide">Practice Entries</p>
        <p className="text-2xl font-bold mt-1">{totalCount}</p>
      </article>
    </div>
  );
}

function ObservabilityCards({ observabilitySummary }: { observabilitySummary: ObservabilitySummary }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
      <article className="app-record-card">
        <p className="text-xs app-copy-soft uppercase tracking-wide">Observability Events (24h)</p>
        <p className="text-2xl font-bold mt-1">{observabilitySummary.last24hEvents}</p>
      </article>
      <article className="app-record-card">
        <p className="text-xs app-copy-soft uppercase tracking-wide">Auth Denials (24h)</p>
        <p className="text-2xl font-bold mt-1">{observabilitySummary.authDenials24h}</p>
      </article>
      <article className="app-record-card">
        <p className="text-xs app-copy-soft uppercase tracking-wide">Import Issues (24h)</p>
        <p className="text-2xl font-bold mt-1">{observabilitySummary.importIssues24h}</p>
      </article>
      <article className="app-record-card">
        <p className="text-xs app-copy-soft uppercase tracking-wide">Personalization Issues (24h)</p>
        <p className="text-2xl font-bold mt-1">{observabilitySummary.personalizationIssues24h}</p>
      </article>
    </div>
  );
}

function ObservabilityAlertsCard({
  observabilitySummary,
  autoCreatedIncidents,
}: {
  observabilitySummary: ObservabilitySummary;
  autoCreatedIncidents: BasicEntry[];
}) {
  return (
    <article className="app-record-card">
      <h4 className="font-semibold mb-2">Observability Alerts</h4>
      {observabilitySummary.alerts.length === 0 ? (
        <p className="text-sm app-copy-soft">No active alerts. Signals are within threshold.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {observabilitySummary.alerts.map((alert) => (
            <li key={`${alert.level}-${alert.title}`} className="border-b border-(--border-soft) pb-2 last:border-b-0">
              <p className="font-medium">
                <span className={alert.level === "critical" ? "text-red-700 dark:text-red-300" : "text-amber-700 dark:text-amber-300"}>
                  {alert.level.toUpperCase()}
                </span>{" "}
                {alert.title}
              </p>
              <p className="app-copy-soft text-xs">{alert.detail}</p>
              <p className="app-copy-soft text-xs">Category: {alert.category} · Owner: {alert.owner} · Runbook: {alert.runbook}</p>
            </li>
          ))}
        </ul>
      )}
      {autoCreatedIncidents.length > 0 ? (
        <p className="text-xs app-copy-soft mt-2">
          Auto-ticketing created {autoCreatedIncidents.length} critical incident{autoCreatedIncidents.length === 1 ? "" : "s"}.
        </p>
      ) : null}
    </article>
  );
}

function TrendsPanel({ observabilitySummary }: { observabilitySummary: ObservabilitySummary }) {
  const authPoints = buildSparklinePoints(observabilitySummary.weeklyAuthDenials.map((item) => item.count));
  const importPoints = buildSparklinePoints(observabilitySummary.weeklyImportIssues.map((item) => item.count));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <article className="app-record-card">
        <h4 className="font-semibold mb-2">Auth Denials (7-day trend)</h4>
        <svg viewBox="0 0 200 56" className="w-full h-16" role="img" aria-label="Auth denial trend sparkline">
          <polyline fill="none" stroke="currentColor" strokeWidth="2" points={authPoints} />
        </svg>
        <p className="app-copy-soft text-xs mt-2">
          {observabilitySummary.weeklyAuthDenials.map((item) => `${item.day}:${item.count}`).join(" · ")}
        </p>
      </article>

      <article className="app-record-card">
        <h4 className="font-semibold mb-2">Import Issues (7-day trend)</h4>
        <svg viewBox="0 0 200 56" className="w-full h-16" role="img" aria-label="Import issue trend sparkline">
          <polyline fill="none" stroke="currentColor" strokeWidth="2" points={importPoints} />
        </svg>
        <p className="app-copy-soft text-xs mt-2">
          {observabilitySummary.weeklyImportIssues.map((item) => `${item.day}:${item.count}`).join(" · ")}
        </p>
      </article>
    </div>
  );
}

function ServerErrorLogCard({ errorLog }: { errorLog: AppErrorEntry[] }) {
  return (
    <article className="app-record-card">
      <h4 className="font-semibold mb-2">Server Error Log <span className="text-xs app-copy-soft font-normal ml-1">({errorLog.length} total)</span></h4>
      {errorLog.length === 0 ? (
        <p className="text-sm app-copy-soft">No server errors recorded. 🎉</p>
      ) : (
        <ul className="space-y-2 text-sm max-h-64 overflow-y-auto">
          {errorLog.slice(-20).reverse().map((entry) => (
            <li key={entry.id} className="border-b border-(--border-soft) pb-2 last:border-b-0">
              <p className="font-medium text-red-700 dark:text-red-300">{entry.errorName}: {entry.errorMessage}</p>
              <p className="app-copy-soft text-xs">{entry.method} {entry.route}</p>
              <p className="app-copy-soft text-xs">{formatTimestamp(entry.at)}</p>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function OpsDetailGrid({
  observabilityEvents,
  practiceCounts,
  audits,
}: {
  observabilityEvents: ObservabilityEventEntry[];
  practiceCounts: Array<{ module: string; count: number }>;
  audits: AdminAuditEntry[];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <article className="app-record-card">
        <h4 className="font-semibold mb-2">Recent Observability Events</h4>
        {observabilityEvents.length === 0 ? (
          <p className="text-sm app-copy-soft">No observability events captured yet.</p>
        ) : (
          <ul className="space-y-2 text-sm max-h-64 overflow-y-auto">
            {observabilityEvents.slice(-20).reverse().map((item) => (
              <li key={item.id ?? `${item.event}-${item.at}`} className="border-b border-(--border-soft) pb-2 last:border-b-0">
                <p className="font-medium">{item.event}</p>
                <p className="app-copy-soft text-xs">{item.source} · {item.severity}{item.statusCode ? ` · ${item.statusCode}` : ""}</p>
                <p className="app-copy-soft text-xs">{formatTimestamp(item.at)}</p>
              </li>
            ))}
          </ul>
        )}
      </article>

      <article className="app-record-card">
        <h4 className="font-semibold mb-2">Module Footprint</h4>
        <ul className="space-y-1 text-sm app-copy-soft">
          {practiceCounts.map((stat) => (
            <li key={stat.module} className="flex items-center justify-between">
              <span>{stat.module}</span>
              <strong className="app-copy">{stat.count}</strong>
            </li>
          ))}
        </ul>
      </article>

      <article className="app-record-card">
        <h4 className="font-semibold mb-2">Recent Audit Trail</h4>
        {audits.length === 0 ? (
          <p className="text-sm app-copy-soft">No admin audit events yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {audits.slice(-6).reverse().map((item) => (
              <li key={item.id ?? `${item.action}-${item.at}`} className="border-b border-(--border-soft) pb-2 last:border-b-0">
                <p className="font-medium">{item.action}</p>
                <p className="app-copy-soft text-xs">{item.detail}</p>
                <p className="app-copy-soft text-xs">{formatTimestamp(item.at)} · {item.severity}</p>
              </li>
            ))}
          </ul>
        )}
      </article>
    </div>
  );
}

function ActionForms({
  logIncident,
  createExperiment,
}: {
  logIncident: (formData: FormData) => Promise<void>;
  createExperiment: (formData: FormData) => Promise<void>;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <article className="app-record-card">
        <h4 className="font-semibold mb-3">Log Incident</h4>
        <form action={logIncident} className="space-y-2">
          <input name="title" className="app-input w-full" placeholder="Incident title" required />
          <select name="severity" className="app-input w-full" defaultValue="warning" aria-label="Incident severity">
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
          <textarea name="note" className="app-input w-full" placeholder="Notes / impact" rows={3} />
          <button type="submit" className="app-button-primary px-3 py-2 rounded-lg text-sm">Create Incident</button>
        </form>
      </article>

      <article className="app-record-card">
        <h4 className="font-semibold mb-3">Plan Experiment</h4>
        <form action={createExperiment} className="space-y-2">
          <input name="name" className="app-input w-full" placeholder="Experiment name" required />
          <input name="metric" className="app-input w-full" placeholder="Metric (e.g. 7-day retention)" required />
          <input name="target" className="app-input w-full" placeholder="Target (e.g. +8%)" required />
          <textarea name="hypothesis" className="app-input w-full" placeholder="Hypothesis" rows={3} required />
          <button type="submit" className="app-button-primary px-3 py-2 rounded-lg text-sm">Create Experiment</button>
        </form>
      </article>
    </div>
  );
}

function IncidentAndExperimentPanels({
  incidentFilter,
  incidentStats,
  incidentsWithAuto,
  resolveIncident,
  experiments,
}: {
  incidentFilter: IncidentFilter;
  incidentStats: IncidentStats;
  incidentsWithAuto: BasicEntry[];
  resolveIncident: (formData: FormData) => Promise<void>;
  experiments: BasicEntry[];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <article className="app-record-card">
        <div className="flex items-center justify-between gap-2 mb-2">
          <h4 className="font-semibold">Recent Incidents</h4>
          <div className="flex items-center gap-2 text-xs">
            <a href="/admin?incidents=open" className={incidentFilter === "open" ? "app-user-action px-2 py-1 rounded" : "app-copy-soft"}>
              Open only ({incidentStats.openCount})
            </a>
            <a href="/admin?incidents=all" className={incidentFilter === "all" ? "app-user-action px-2 py-1 rounded" : "app-copy-soft"}>
              All ({incidentsWithAuto.length})
            </a>
            <span className="app-copy-soft">Resolved ({incidentStats.resolvedCount})</span>
          </div>
        </div>
        {incidentStats.visibleIncidents.length === 0 ? (
          <p className="text-sm app-copy-soft">No incidents logged.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {incidentStats.visibleIncidents.slice(-6).reverse().map((incident) => (
              <li key={incident.id ?? `${incident.title}-${incident.createdAt}`} className="border-b border-(--border-soft) pb-2 last:border-b-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{incident.title ?? "Untitled"}</p>
                    <p className="app-copy-soft text-xs">{incident.severity} · {incident.status ?? "open"}</p>
                    <p className="app-copy-soft text-xs">{formatTimestamp(incident.createdAt)}</p>
                    {incident.status === "resolved" && incident.resolvedAt ? (
                      <p className="app-copy-soft text-xs">Resolved: {formatTimestamp(incident.resolvedAt)}</p>
                    ) : null}
                  </div>
                  {incident.status !== "resolved" && incident.id ? (
                    <form action={resolveIncident}>
                      <input type="hidden" name="incidentId" value={incident.id} />
                      <button type="submit" className="app-user-action px-2 py-1 rounded text-xs">
                        Resolve
                      </button>
                    </form>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </article>

      <article className="app-record-card">
        <h4 className="font-semibold mb-2">Recent Experiments</h4>
        {experiments.length === 0 ? (
          <p className="text-sm app-copy-soft">No experiments created.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {experiments.slice(-6).reverse().map((experiment) => (
              <li key={experiment.id ?? `${experiment.name}-${experiment.createdAt}`} className="border-b border-(--border-soft) pb-2 last:border-b-0">
                <p className="font-medium">{experiment.name ?? "Untitled"}</p>
                <p className="app-copy-soft text-xs">{experiment.metric ?? "Metric n/a"} · {experiment.status ?? "planned"}</p>
                <p className="app-copy-soft text-xs">{formatTimestamp(experiment.createdAt)}</p>
              </li>
            ))}
          </ul>
        )}
      </article>
    </div>
  );
}

export default function AdminDashboardView(props: AdminDashboardProps) {
  return (
    <section className="app-surface-card max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="app-panel-title text-xl sm:text-2xl font-bold">Admin Control Center</h3>
          <p className="app-copy-soft text-sm">
            World-class operations: metrics, incident discipline, and experiment rigor.
          </p>
          <p className="app-copy-soft text-xs mt-1">Admin actor: {props.actorUserId}</p>
        </div>
        <form action={props.lockAdmin}>
          <button type="submit" className="app-user-action px-3 py-2 rounded-lg text-sm">
            Lock Admin
          </button>
        </form>
      </div>

      <StatCards
        reliabilityScore={props.reliabilityScore}
        errorBudgetRemaining={props.errorBudgetRemaining}
        activeExperiments={props.activeExperiments}
        totalCount={props.totalCount}
      />

      <ObservabilityCards observabilitySummary={props.observabilitySummary} />
      <ObservabilityAlertsCard
        observabilitySummary={props.observabilitySummary}
        autoCreatedIncidents={props.autoCreatedIncidents}
      />
      <TrendsPanel observabilitySummary={props.observabilitySummary} />
      <ServerErrorLogCard errorLog={props.errorLog} />

      <OpsDetailGrid
        observabilityEvents={props.observabilityEvents}
        practiceCounts={props.practiceCounts}
        audits={props.audits}
      />

      <ActionForms logIncident={props.logIncident} createExperiment={props.createExperiment} />

      <IncidentAndExperimentPanels
        incidentFilter={props.incidentFilter}
        incidentStats={props.incidentStats}
        incidentsWithAuto={props.incidentsWithAuto}
        resolveIncident={props.resolveIncident}
        experiments={props.experiments}
      />
    </section>
  );
}
