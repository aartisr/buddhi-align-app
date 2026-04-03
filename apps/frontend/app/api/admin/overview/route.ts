import { NextResponse } from "next/server";

import { createDataProvider } from "@buddhi-align/data-access";
import { requireAdminApiAccess } from "../_auth";
import { ADMIN_AUDIT_MODULE, type AdminAuditEntry } from "@/app/admin/_audit";

const PRACTICE_MODULES = ["karma", "bhakti", "jnana", "dhyana", "vasana", "dharma"] as const;
const ADMIN_EXPERIMENT_MODULE = "__admin_experiment";
const ADMIN_INCIDENT_MODULE = "__admin_incident";

type BasicEntry = { id?: string; createdAt?: string; at?: string; severity?: "info" | "warning" | "critical"; status?: string };

export async function GET() {
  const authResult = await requireAdminApiAccess();
  if (!authResult.ok) return authResult.response;

  try {
    const provider = createDataProvider();
    const practiceCounts = await Promise.all(
      PRACTICE_MODULES.map(async (module) => {
        const rows = await provider.list<BasicEntry>(module);
        return { module, count: rows.length };
      }),
    );

    const audits = await provider.list<AdminAuditEntry>(ADMIN_AUDIT_MODULE);
    const incidents = await provider.list<BasicEntry>(ADMIN_INCIDENT_MODULE);
    const experiments = await provider.list<BasicEntry>(ADMIN_EXPERIMENT_MODULE);

    const severityPenalty = incidents.reduce((penalty, incident) => {
      if (incident.severity === "critical") return penalty + 12;
      if (incident.severity === "warning") return penalty + 4;
      return penalty + 1;
    }, 0);

    const reliabilityScore = Math.max(0, 100 - severityPenalty);
    const activeExperiments = experiments.filter((exp) => exp.status === "active").length;

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      practiceCounts,
      totals: {
        practiceEntries: practiceCounts.reduce((sum, item) => sum + item.count, 0),
        incidents: incidents.length,
        activeExperiments,
      },
      slo: {
        reliabilityScore,
        errorBudgetRemaining: Math.max(0, 100 - severityPenalty),
      },
      recent: {
        audits: audits.slice(-10).reverse(),
        incidents: incidents.slice(-10).reverse(),
        experiments: experiments.slice(-10).reverse(),
      },
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `Admin overview failed: ${detail}` }, { status: 500 });
  }
}
