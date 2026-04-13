import type { AdminAuditEntry } from "./_audit";
import type { AppErrorEntry } from "@/app/lib/server-error-log";
import type { ObservabilitySummary } from "@/app/lib/observability-summary";
import type { ObservabilityEventEntry } from "@/app/lib/server-observability";
import type { IncidentFilter } from "./incident-operations";
import { translate, DEFAULT_LOCALE } from "@/app/i18n/config";

const t = (key: Parameters<typeof translate>[1], vars?: Record<string, string | number>) =>
  translate(DEFAULT_LOCALE, key, vars);

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

type ObservabilityFilter = "all" | "discourse-sso" | "invite-funnel";

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
  observabilityFilter: ObservabilityFilter;
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
        <p className="text-xs app-copy-soft uppercase tracking-wide">{t("admin.stats.reliabilityScore")}</p>
        <p className="text-2xl font-bold mt-1">{reliabilityScore}</p>
      </article>
      <article className="app-record-card">
        <p className="text-xs app-copy-soft uppercase tracking-wide">{t("admin.stats.errorBudgetLeft")}</p>
        <p className="text-2xl font-bold mt-1">{errorBudgetRemaining}%</p>
      </article>
      <article className="app-record-card">
        <p className="text-xs app-copy-soft uppercase tracking-wide">{t("admin.stats.activeExperiments")}</p>
        <p className="text-2xl font-bold mt-1">{activeExperiments}</p>
      </article>
      <article className="app-record-card">
        <p className="text-xs app-copy-soft uppercase tracking-wide">{t("admin.stats.practiceEntries")}</p>
        <p className="text-2xl font-bold mt-1">{totalCount}</p>
      </article>
    </div>
  );
}

function ObservabilityCards({ observabilitySummary }: { observabilitySummary: ObservabilitySummary }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
      <article className="app-record-card">
        <p className="text-xs app-copy-soft uppercase tracking-wide">{t("admin.obs.events24h")}</p>
        <p className="text-2xl font-bold mt-1">{observabilitySummary.last24hEvents}</p>
      </article>
      <article className="app-record-card">
        <p className="text-xs app-copy-soft uppercase tracking-wide">{t("admin.obs.authDenials24h")}</p>
        <p className="text-2xl font-bold mt-1">{observabilitySummary.authDenials24h}</p>
      </article>
      <article className="app-record-card">
        <p className="text-xs app-copy-soft uppercase tracking-wide">{t("admin.obs.importIssues24h")}</p>
        <p className="text-2xl font-bold mt-1">{observabilitySummary.importIssues24h}</p>
      </article>
      <article className="app-record-card">
        <p className="text-xs app-copy-soft uppercase tracking-wide">{t("admin.obs.personalizationIssues24h")}</p>
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
      <h4 className="font-semibold mb-2">{t("admin.alerts.title")}</h4>
      {observabilitySummary.alerts.length === 0 ? (
        <p className="text-sm app-copy-soft">{t("admin.alerts.empty")}</p>
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
              <p className="app-copy-soft text-xs">{t("admin.alerts.meta", { category: alert.category, owner: alert.owner, runbook: alert.runbook })}</p>
            </li>
          ))}
        </ul>
      )}
      {autoCreatedIncidents.length > 0 ? (
        <p className="text-xs app-copy-soft mt-2">
          {t("admin.alerts.autoCreated", {
            count: autoCreatedIncidents.length,
            suffix: autoCreatedIncidents.length === 1 ? "" : "s",
          })}
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
        <h4 className="font-semibold mb-2">{t("admin.trends.authTitle")}</h4>
        <svg viewBox="0 0 200 56" className="w-full h-16" role="img" aria-label={t("admin.trends.authAria")}>
          <polyline fill="none" stroke="currentColor" strokeWidth="2" points={authPoints} />
        </svg>
        <p className="app-copy-soft text-xs mt-2">
          {observabilitySummary.weeklyAuthDenials.map((item) => `${item.day}:${item.count}`).join(" · ")}
        </p>
      </article>

      <article className="app-record-card">
        <h4 className="font-semibold mb-2">{t("admin.trends.importTitle")}</h4>
        <svg viewBox="0 0 200 56" className="w-full h-16" role="img" aria-label={t("admin.trends.importAria")}>
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
      <h4 className="font-semibold mb-2">{t("admin.errors.title")} <span className="text-xs app-copy-soft font-normal ml-1">({t("admin.errors.total", { count: errorLog.length })})</span></h4>
      {errorLog.length === 0 ? (
        <p className="text-sm app-copy-soft">{t("admin.errors.empty")}</p>
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

const DISCOURSE_SSO_MAPPING_EVENT = "community_discourse_sso_role_group_mapping_applied";
const INVITE_START_NOW_CLICKED_EVENT = "invite_start_now_clicked";
const INVITE_FIRST_ENTRY_SUBMITTED_EVENT = "invite_first_entry_submitted";

function getDataBoolean(data: Record<string, unknown> | undefined, key: string): string {
  const value = data?.[key];
  return typeof value === "boolean" ? (value ? "yes" : "no") : "n/a";
}

function getDataNumber(data: Record<string, unknown> | undefined, key: string): string {
  const value = data?.[key];
  return typeof value === "number" ? String(value) : "n/a";
}

function getDataString(data: Record<string, unknown> | undefined, key: string): string {
  const value = data?.[key];
  return typeof value === "string" && value.trim().length > 0 ? value : "n/a";
}

function DiscourseSsoMappingsCard({ observabilityEvents }: { observabilityEvents: ObservabilityEventEntry[] }) {
  const mappingEvents = observabilityEvents
    .filter((item) => item.event === DISCOURSE_SSO_MAPPING_EVENT)
    .slice(-8)
    .reverse();

  return (
    <article className="app-record-card">
      <h4 className="font-semibold mb-2">{t("admin.discourseMappings.title")}</h4>
      {mappingEvents.length === 0 ? (
        <p className="text-sm app-copy-soft">{t("admin.discourseMappings.empty")}</p>
      ) : (
        <ul className="space-y-2 text-sm max-h-64 overflow-y-auto">
          {mappingEvents.map((item) => (
            <li key={item.id ?? `${item.event}-${item.at}`} className="border-b border-(--border-soft) pb-2 last:border-b-0">
              <p className="font-medium">{formatTimestamp(item.at)}</p>
              <p className="app-copy-soft text-xs">
                sync={getDataString(item.data, "syncMode")} · adminCookie={getDataBoolean(item.data, "hasAppAdminAccess")}
              </p>
              <p className="app-copy-soft text-xs">
                admin={getDataBoolean(item.data, "admin")} · moderator={getDataBoolean(item.data, "moderator")}
              </p>
              <p className="app-copy-soft text-xs">
                groups={getDataNumber(item.data, "mappedGroupCount")} / pre={getDataNumber(item.data, "prePolicyGroupCount")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function InviteConversionCard({ observabilityEvents }: { observabilityEvents: ObservabilityEventEntry[] }) {
  const startEvents = observabilityEvents.filter((item) => item.event === INVITE_START_NOW_CLICKED_EVENT);
  const conversionEvents = observabilityEvents.filter((item) => item.event === INVITE_FIRST_ENTRY_SUBMITTED_EVENT);

  const starts = startEvents.length;
  const conversions = conversionEvents.length;
  const conversionRate = starts > 0 ? Math.round((conversions / starts) * 100) : 0;
  const lastStartAt = startEvents.at(-1)?.at;
  const lastConversionAt = conversionEvents.at(-1)?.at;

  return (
    <article className="app-record-card">
      <h4 className="font-semibold mb-2">{t("admin.inviteFunnel.title")}</h4>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg border border-(--border-soft) p-2">
          <p className="text-xs app-copy-soft">{t("admin.inviteFunnel.starts")}</p>
          <p className="text-lg font-semibold app-copy">{starts}</p>
        </div>
        <div className="rounded-lg border border-(--border-soft) p-2">
          <p className="text-xs app-copy-soft">{t("admin.inviteFunnel.firstEntries")}</p>
          <p className="text-lg font-semibold app-copy">{conversions}</p>
        </div>
        <div className="rounded-lg border border-(--border-soft) p-2">
          <p className="text-xs app-copy-soft">{t("admin.inviteFunnel.conversion")}</p>
          <p className="text-lg font-semibold app-copy">{conversionRate}%</p>
        </div>
      </div>
      <p className="app-copy-soft text-xs mt-2">
        {t("admin.inviteFunnel.lastStart", { value: lastStartAt ? formatTimestamp(lastStartAt) : "n/a" })}
      </p>
      <p className="app-copy-soft text-xs mt-1">
        {t("admin.inviteFunnel.lastFirstEntry", { value: lastConversionAt ? formatTimestamp(lastConversionAt) : "n/a" })}
      </p>
    </article>
  );
}

function OpsDetailGrid({
  observabilityEvents,
  observabilityFilter,
  incidentFilter,
  practiceCounts,
  audits,
}: {
  observabilityEvents: ObservabilityEventEntry[];
  observabilityFilter: ObservabilityFilter;
  incidentFilter: IncidentFilter;
  practiceCounts: Array<{ module: string; count: number }>;
  audits: AdminAuditEntry[];
}) {
  const filteredEvents = observabilityFilter === "discourse-sso"
    ? observabilityEvents.filter((item) => item.event === DISCOURSE_SSO_MAPPING_EVENT)
    : observabilityFilter === "invite-funnel"
      ? observabilityEvents.filter(
        (item) => item.event === INVITE_START_NOW_CLICKED_EVENT || item.event === INVITE_FIRST_ENTRY_SUBMITTED_EVENT,
      )
      : observabilityEvents;

  const allLinkClass = observabilityFilter === "all"
    ? "app-user-action px-2 py-1 rounded"
    : "app-copy-soft";

  const discourseLinkClass = observabilityFilter === "discourse-sso"
    ? "app-user-action px-2 py-1 rounded"
    : "app-copy-soft";

  const inviteLinkClass = observabilityFilter === "invite-funnel"
    ? "app-user-action px-2 py-1 rounded"
    : "app-copy-soft";

  function buildFilterHref(nextObservabilityFilter: ObservabilityFilter): string {
    const params = new URLSearchParams();
    if (incidentFilter !== "open") {
      params.set("incidents", incidentFilter);
    }
    if (nextObservabilityFilter !== "all") {
      params.set("obs", nextObservabilityFilter);
    }
    const query = params.toString();
    return query ? `/admin?${query}` : "/admin";
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <article className="app-record-card">
        <div className="flex items-center justify-between gap-2 mb-2">
          <h4 className="font-semibold">{t("admin.obs.recentTitle")}</h4>
          <div className="flex items-center gap-2 text-xs">
            <a href={buildFilterHref("all")} className={allLinkClass}>{t("admin.obs.filter.all")}</a>
            <a href={buildFilterHref("discourse-sso")} className={discourseLinkClass}>{t("admin.obs.filter.discourse")}</a>
            <a href={buildFilterHref("invite-funnel")} className={inviteLinkClass}>{t("admin.obs.filter.invite")}</a>
            <span className="app-copy-soft">{t("admin.obs.filter.shown", { count: filteredEvents.length })}</span>
          </div>
        </div>
        {filteredEvents.length === 0 ? (
          <p className="text-sm app-copy-soft">{t("admin.obs.empty")}</p>
        ) : (
          <ul className="space-y-2 text-sm max-h-64 overflow-y-auto">
            {filteredEvents.slice(-20).reverse().map((item) => (
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
        <h4 className="font-semibold mb-2">{t("admin.ops.moduleFootprint")}</h4>
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
        <h4 className="font-semibold mb-2">{t("admin.ops.auditTrail")}</h4>
        {audits.length === 0 ? (
          <p className="text-sm app-copy-soft">{t("admin.ops.auditEmpty")}</p>
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

      <DiscourseSsoMappingsCard observabilityEvents={observabilityEvents} />
      <InviteConversionCard observabilityEvents={observabilityEvents} />
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
        <h4 className="font-semibold mb-3">{t("admin.forms.logIncident")}</h4>
        <form action={logIncident} className="space-y-2">
          <input name="title" className="app-input w-full" placeholder={t("admin.forms.incidentTitle")} required />
          <select name="severity" className="app-input w-full" defaultValue="warning" aria-label={t("admin.forms.incidentSeverity")}>
            <option value="info">{t("admin.forms.severity.info")}</option>
            <option value="warning">{t("admin.forms.severity.warning")}</option>
            <option value="critical">{t("admin.forms.severity.critical")}</option>
          </select>
          <textarea name="note" className="app-input w-full" placeholder={t("admin.forms.incidentNotes")} rows={3} />
          <button type="submit" className="app-button-primary px-3 py-2 rounded-lg text-sm">{t("admin.forms.createIncident")}</button>
        </form>
      </article>

      <article className="app-record-card">
        <h4 className="font-semibold mb-3">{t("admin.forms.planExperiment")}</h4>
        <form action={createExperiment} className="space-y-2">
          <input name="name" className="app-input w-full" placeholder={t("admin.forms.experimentName")} required />
          <input name="metric" className="app-input w-full" placeholder={t("admin.forms.experimentMetric")} required />
          <input name="target" className="app-input w-full" placeholder={t("admin.forms.experimentTarget")} required />
          <textarea name="hypothesis" className="app-input w-full" placeholder={t("admin.forms.experimentHypothesis")} rows={3} required />
          <button type="submit" className="app-button-primary px-3 py-2 rounded-lg text-sm">{t("admin.forms.createExperiment")}</button>
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
          <h4 className="font-semibold">{t("admin.incidents.recent")}</h4>
          <div className="flex items-center gap-2 text-xs">
            <a href="/admin?incidents=open" className={incidentFilter === "open" ? "app-user-action px-2 py-1 rounded" : "app-copy-soft"}>
              {t("admin.incidents.openOnly", { count: incidentStats.openCount })}
            </a>
            <a href="/admin?incidents=all" className={incidentFilter === "all" ? "app-user-action px-2 py-1 rounded" : "app-copy-soft"}>
              {t("admin.incidents.all", { count: incidentsWithAuto.length })}
            </a>
            <span className="app-copy-soft">{t("admin.incidents.resolved", { count: incidentStats.resolvedCount })}</span>
          </div>
        </div>
        {incidentStats.visibleIncidents.length === 0 ? (
          <p className="text-sm app-copy-soft">{t("admin.incidents.empty")}</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {incidentStats.visibleIncidents.slice(-6).reverse().map((incident) => (
              <li key={incident.id ?? `${incident.title}-${incident.createdAt}`} className="border-b border-(--border-soft) pb-2 last:border-b-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{incident.title ?? t("admin.incidents.untitled")}</p>
                    <p className="app-copy-soft text-xs">{incident.severity} · {incident.status ?? t("admin.incidents.open")}</p>
                    <p className="app-copy-soft text-xs">{formatTimestamp(incident.createdAt)}</p>
                    {incident.status === "resolved" && incident.resolvedAt ? (
                      <p className="app-copy-soft text-xs">{t("admin.incidents.resolvedAt", { value: formatTimestamp(incident.resolvedAt) })}</p>
                    ) : null}
                  </div>
                  {incident.status !== "resolved" && incident.id ? (
                    <form action={resolveIncident}>
                      <input type="hidden" name="incidentId" value={incident.id} />
                      <button type="submit" className="app-user-action px-2 py-1 rounded text-xs">
                        {t("admin.incidents.resolve")}
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
        <h4 className="font-semibold mb-2">{t("admin.experiments.recent")}</h4>
        {experiments.length === 0 ? (
          <p className="text-sm app-copy-soft">{t("admin.experiments.empty")}</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {experiments.slice(-6).reverse().map((experiment) => (
              <li key={experiment.id ?? `${experiment.name}-${experiment.createdAt}`} className="border-b border-(--border-soft) pb-2 last:border-b-0">
                <p className="font-medium">{experiment.name ?? t("admin.incidents.untitled")}</p>
                <p className="app-copy-soft text-xs">{experiment.metric ?? t("admin.experiments.metricFallback")} · {experiment.status ?? t("admin.experiments.planned")}</p>
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
          <h3 className="app-panel-title text-xl sm:text-2xl font-bold">{t("admin.dashboard.title")}</h3>
          <p className="app-copy-soft text-sm">
            {t("admin.dashboard.subtitle")}
          </p>
          <p className="app-copy-soft text-xs mt-1">{t("admin.dashboard.actor", { actor: props.actorUserId })}</p>
        </div>
        <form action={props.lockAdmin}>
          <button type="submit" className="app-user-action px-3 py-2 rounded-lg text-sm">
            {t("admin.dashboard.lock")}
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
        observabilityFilter={props.observabilityFilter}
        incidentFilter={props.incidentFilter}
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
