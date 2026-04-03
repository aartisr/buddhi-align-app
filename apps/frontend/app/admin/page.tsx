import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { createDataProvider } from "@buddhi-align/data-access";
import { ADMIN_COOKIE_NAME, isAdminCookieValid } from "@/app/auth/admin";
import ModuleLayout from "../components/ModuleLayout";
import { ADMIN_AUDIT_MODULE, type AdminAuditEntry, writeAdminAudit } from "./_audit";

const PRACTICE_MODULES = ["karma", "bhakti", "jnana", "dhyana", "vasana", "dharma"] as const;
const ADMIN_EXPERIMENT_MODULE = "__admin_experiment";
const ADMIN_INCIDENT_MODULE = "__admin_incident";

type BasicEntry = {
  id: string;
  createdAt?: string;
  title?: string;
  severity?: "info" | "warning" | "critical";
  status?: string;
  name?: string;
  metric?: string;
  [key: string]: unknown;
};

export const dynamic = "force-dynamic";

function formatTimestamp(iso?: string): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

async function requireAdminSession() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in?callbackUrl=%2Fadmin");
  }

  const adminCookie = cookies().get(ADMIN_COOKIE_NAME)?.value;
  if (!isAdminCookieValid(adminCookie)) {
    redirect("/admin-access?callbackUrl=%2Fadmin");
  }

  return session.user.id;
}

export default async function AdminPage() {
  const actorUserId = await requireAdminSession();

  const provider = createDataProvider();

  const [practiceCounts, audits, incidents, experiments] = await Promise.all([
    Promise.all(
      PRACTICE_MODULES.map(async (module) => {
        const rows = await provider.list<BasicEntry>(module);
        return { module, count: rows.length };
      }),
    ),
    provider.list<AdminAuditEntry>(ADMIN_AUDIT_MODULE),
    provider.list<BasicEntry>(ADMIN_INCIDENT_MODULE),
    provider.list<BasicEntry>(ADMIN_EXPERIMENT_MODULE),
  ]);

  const severityPenalty = incidents.reduce((penalty, incident) => {
    if (incident.severity === "critical") return penalty + 12;
    if (incident.severity === "warning") return penalty + 4;
    return penalty + 1;
  }, 0);

  const reliabilityScore = Math.max(0, 100 - severityPenalty);
  const errorBudgetRemaining = Math.max(0, 100 - severityPenalty);
  const activeExperiments = experiments.filter((exp) => exp.status === "active").length;

  const totalCount = practiceCounts.reduce((sum, item) => sum + item.count, 0);

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

  return (
    <ModuleLayout titleKey="admin.title">
      <section className="app-surface-card max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="app-panel-title text-xl sm:text-2xl font-bold">Admin Control Center</h3>
            <p className="app-copy-soft text-sm">
              World-class operations: metrics, incident discipline, and experiment rigor.
            </p>
            <p className="app-copy-soft text-xs mt-1">Admin actor: {actorUserId}</p>
          </div>
          <form action={lockAdmin}>
            <button type="submit" className="app-user-action px-3 py-2 rounded-lg text-sm">
              Lock Admin
            </button>
          </form>
        </div>

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                  <li key={item.id ?? `${item.action}-${item.at}`} className="border-b border-[var(--border-soft)] pb-2 last:border-b-0">
                    <p className="font-medium">{item.action}</p>
                    <p className="app-copy-soft text-xs">{item.detail}</p>
                    <p className="app-copy-soft text-xs">{formatTimestamp(item.at)} · {item.severity}</p>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <article className="app-record-card">
            <h4 className="font-semibold mb-3">Log Incident</h4>
            <form action={logIncident} className="space-y-2">
              <input name="title" className="app-input w-full" placeholder="Incident title" required />
              <select name="severity" className="app-input w-full" defaultValue="warning">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <article className="app-record-card">
            <h4 className="font-semibold mb-2">Recent Incidents</h4>
            {incidents.length === 0 ? (
              <p className="text-sm app-copy-soft">No incidents logged.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {incidents.slice(-6).reverse().map((incident) => (
                  <li key={incident.id ?? `${incident.title}-${incident.createdAt}`} className="border-b border-[var(--border-soft)] pb-2 last:border-b-0">
                    <p className="font-medium">{incident.title ?? "Untitled"}</p>
                    <p className="app-copy-soft text-xs">{incident.severity} · {incident.status ?? "open"}</p>
                    <p className="app-copy-soft text-xs">{formatTimestamp(incident.createdAt)}</p>
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
                  <li key={experiment.id ?? `${experiment.name}-${experiment.createdAt}`} className="border-b border-[var(--border-soft)] pb-2 last:border-b-0">
                    <p className="font-medium">{experiment.name ?? "Untitled"}</p>
                    <p className="app-copy-soft text-xs">{experiment.metric ?? "Metric n/a"} · {experiment.status ?? "planned"}</p>
                    <p className="app-copy-soft text-xs">{formatTimestamp(experiment.createdAt)}</p>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </div>
      </section>
    </ModuleLayout>
  );
}
