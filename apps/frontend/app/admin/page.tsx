import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { createDataProvider } from "@buddhi-align/data-access";
import { ADMIN_COOKIE_NAME, isAdminCookieValid } from "@/app/auth/admin";
import { hasOidcConfidence } from "@/app/auth/auth-confidence";
import ModuleLayout from "../components/ModuleLayout";
import AdminDashboardView from "./AdminDashboardView";
import { ADMIN_AUDIT_MODULE, type AdminAuditEntry, writeAdminAudit } from "./_audit";
import { APP_ERROR_LOG_MODULE, type AppErrorEntry } from "@/app/lib/server-error-log";
import {
  OBSERVABILITY_EVENT_MODULE,
  type ObservabilityEventEntry,
} from "@/app/lib/server-observability";
import { buildObservabilitySummary } from "@/app/lib/observability-summary";
import { ANALYTICS_MODULES } from "@/app/api/analytics/types";
import {
  deriveIncidentStats,
  resolveIncidentFilter,
  syncCriticalAlertIncidents,
  type IncidentFilter,
} from "./incident-operations";

type ObservabilityFilter = "all" | "discourse-sso" | "invite-funnel";

function resolveObservabilityFilter(value: string | undefined): ObservabilityFilter {
  if (value === "discourse-sso") return "discourse-sso";
  if (value === "invite-funnel") return "invite-funnel";
  return "all";
}

// Use the shared ANALYTICS_MODULES constant as the single source of truth.
const PRACTICE_MODULES = ANALYTICS_MODULES;
const ADMIN_EXPERIMENT_MODULE = "__admin_experiment";
const ADMIN_INCIDENT_MODULE = "__admin_incident";

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

export const dynamic = "force-dynamic";

async function requireAdminSession() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in?callbackUrl=%2Fadmin");
  }
  if (!hasOidcConfidence(session as { user?: unknown })) {
    redirect("/sign-in?callbackUrl=%2Fadmin&error=OIDCRequired");
  }

  const adminCookie = cookies().get(ADMIN_COOKIE_NAME)?.value;
  if (!isAdminCookieValid(adminCookie)) {
    redirect("/admin-access?callbackUrl=%2Fadmin");
  }

  return session.user.id;
}

async function loadAdminDashboardData(incidentFilter: IncidentFilter) {
  const provider = createDataProvider();

  const [practiceCounts, audits, incidents, experiments, errorLog, observabilityEvents] = await Promise.all([
    Promise.all(
      PRACTICE_MODULES.map(async (module) => {
        const rows = await provider.list<BasicEntry>(module);
        return { module, count: rows.length };
      }),
    ),
    provider.list<AdminAuditEntry>(ADMIN_AUDIT_MODULE),
    provider.list<BasicEntry>(ADMIN_INCIDENT_MODULE),
    provider.list<BasicEntry>(ADMIN_EXPERIMENT_MODULE),
    provider.list<AppErrorEntry>(APP_ERROR_LOG_MODULE),
    provider.list<ObservabilityEventEntry>(OBSERVABILITY_EVENT_MODULE),
  ]);

  const observabilitySummary = buildObservabilitySummary(observabilityEvents);
  const criticalAlerts = observabilitySummary.alerts.filter((alert) => alert.level === "critical");
  const autoCreatedIncidents = await syncCriticalAlertIncidents<BasicEntry>({
    incidents,
    criticalAlerts,
    createIncident: async (incident) => {
      await provider.create<BasicEntry>(ADMIN_INCIDENT_MODULE, incident);
    },
    writeAutoAudit: async (alertKey, at) => {
      await writeAdminAudit({
        actor: "system:observability",
        action: "incident.auto_create",
        detail: `Auto-created incident for alert ${alertKey}`,
        severity: "critical",
        at,
      });
    },
  });

  const incidentsWithAuto = autoCreatedIncidents.length > 0
    ? [...incidents, ...autoCreatedIncidents]
    : incidents;
  const incidentStats = deriveIncidentStats(incidentsWithAuto, incidentFilter);

  const severityPenalty = incidentsWithAuto.reduce((penalty, incident) => {
    if (incident.severity === "critical") return penalty + 12;
    if (incident.severity === "warning") return penalty + 4;
    return penalty + 1;
  }, 0);

  return {
    practiceCounts,
    audits,
    experiments,
    errorLog,
    observabilityEvents,
    observabilitySummary,
    autoCreatedIncidents,
    incidentsWithAuto,
    incidentStats,
    reliabilityScore: Math.max(0, 100 - severityPenalty),
    errorBudgetRemaining: Math.max(0, 100 - severityPenalty),
    activeExperiments: experiments.filter((exp) => exp.status === "active").length,
    totalCount: practiceCounts.reduce((sum, item) => sum + item.count, 0),
  };
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: {
    incidents?: string;
    obs?: string;
  };
}) {
  const actorUserId = await requireAdminSession();
  const incidentFilter = resolveIncidentFilter(searchParams?.incidents);
  const observabilityFilter = resolveObservabilityFilter(searchParams?.obs);
  const {
    practiceCounts,
    audits,
    experiments,
    errorLog,
    observabilityEvents,
    observabilitySummary,
    autoCreatedIncidents,
    incidentsWithAuto,
    incidentStats,
    reliabilityScore,
    errorBudgetRemaining,
    activeExperiments,
    totalCount,
  } = await loadAdminDashboardData(incidentFilter);

  async function lockAdmin() {
    "use server";
    const actor = await requireAdminSession();

    await writeAdminAudit({
      actor,
      action: "admin.lock",
      detail: "Admin module locked via control panel.",
      severity: "info",
    });

    cookies().set({
      name: ADMIN_COOKIE_NAME,
      value: "",
      path: "/",
      maxAge: 0,
    });
    redirect("/");
  }

  async function createExperiment(formData: FormData) {
    "use server";
    const actor = await requireAdminSession();

    const name = String(formData.get("name") ?? "").trim();
    const hypothesis = String(formData.get("hypothesis") ?? "").trim();
    const metric = String(formData.get("metric") ?? "").trim();
    const target = String(formData.get("target") ?? "").trim();

    if (!name || !hypothesis || !metric || !target) {
      return;
    }

    const actionProvider = createDataProvider();
    await actionProvider.create<BasicEntry>(ADMIN_EXPERIMENT_MODULE, {
      id: crypto.randomUUID(),
      name,
      hypothesis,
      metric,
      target,
      status: "planned",
      createdAt: new Date().toISOString(),
      createdBy: actor,
    } as BasicEntry);

    await writeAdminAudit({
      actor,
      action: "experiment.create",
      detail: `Created experiment: ${name}`,
      severity: "info",
    });

    revalidatePath("/admin");
  }

  async function logIncident(formData: FormData) {
    "use server";
    const actor = await requireAdminSession();

    const title = String(formData.get("title") ?? "").trim();
    const severity = String(formData.get("severity") ?? "warning") as "info" | "warning" | "critical";
    const note = String(formData.get("note") ?? "").trim();

    if (!title || !["info", "warning", "critical"].includes(severity)) {
      return;
    }

    const actionProvider = createDataProvider();
    await actionProvider.create<BasicEntry>(ADMIN_INCIDENT_MODULE, {
      id: crypto.randomUUID(),
      title,
      severity,
      status: "open",
      note,
      createdAt: new Date().toISOString(),
      createdBy: actor,
    } as BasicEntry);

    await writeAdminAudit({
      actor,
      action: "incident.create",
      detail: `Logged ${severity} incident: ${title}`,
      severity: severity === "critical" ? "critical" : "warning",
    });

    revalidatePath("/admin");
  }

  async function resolveIncident(formData: FormData) {
    "use server";
    const actor = await requireAdminSession();

    const incidentId = String(formData.get("incidentId") ?? "").trim();
    if (!incidentId) {
      return;
    }

    const actionProvider = createDataProvider();
    const existingIncidents = await actionProvider.list<BasicEntry>(ADMIN_INCIDENT_MODULE);
    const incident = existingIncidents.find((item) => item.id === incidentId);

    if (!incident || incident.status === "resolved") {
      return;
    }

    const resolvedAt = new Date().toISOString();
    await actionProvider.update<BasicEntry>(
      ADMIN_INCIDENT_MODULE,
      incidentId,
      {
        status: "resolved",
        resolvedAt,
        resolvedBy: actor,
      },
    );

    await writeAdminAudit({
      actor,
      action: "incident.resolve",
      detail: `Resolved incident: ${incident.title ?? incidentId}`,
      severity: "info",
      at: resolvedAt,
    });

    revalidatePath("/admin");
  }

  return (
    <ModuleLayout titleKey="admin.title">
      <AdminDashboardView
        actorUserId={actorUserId}
        reliabilityScore={reliabilityScore}
        errorBudgetRemaining={errorBudgetRemaining}
        activeExperiments={activeExperiments}
        totalCount={totalCount}
        observabilitySummary={observabilitySummary}
        autoCreatedIncidents={autoCreatedIncidents}
        errorLog={errorLog}
        observabilityEvents={observabilityEvents}
        practiceCounts={practiceCounts}
        audits={audits}
        incidentsWithAuto={incidentsWithAuto}
        incidentFilter={incidentFilter}
        observabilityFilter={observabilityFilter}
        incidentStats={incidentStats}
        experiments={experiments}
        lockAdmin={lockAdmin}
        logIncident={logIncident}
        createExperiment={createExperiment}
        resolveIncident={resolveIncident}
      />
    </ModuleLayout>
  );
}
