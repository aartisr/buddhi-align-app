import { NextRequest, NextResponse } from "next/server";

import { createDataProvider } from "@buddhi-align/data-access";
import { requireAdminApiAccess } from "../_auth";
import { writeAdminAudit } from "@/app/admin/_audit";

const ADMIN_EXPERIMENT_MODULE = "__admin_experiment";

interface AdminExperimentEntry {
  id: string;
  name: string;
  hypothesis: string;
  metric: string;
  target: string;
  status: "planned" | "active" | "completed";
  createdAt: string;
  createdBy: string;
  [key: string]: unknown;
}

export async function POST(req: NextRequest) {
  const authResult = await requireAdminApiAccess({ requireStepUp: true });
  if (!authResult.ok) return authResult.response;

  let body: Partial<AdminExperimentEntry>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const hypothesis = String(body.hypothesis ?? "").trim();
  const metric = String(body.metric ?? "").trim();
  const target = String(body.target ?? "").trim();

  if (!name || !hypothesis || !metric || !target) {
    return NextResponse.json({ error: "name, hypothesis, metric, and target are required" }, { status: 400 });
  }

  const provider = createDataProvider();
  const created = await provider.create<AdminExperimentEntry>(ADMIN_EXPERIMENT_MODULE, {
    name,
    hypothesis,
    metric,
    target,
    status: "planned",
    createdAt: new Date().toISOString(),
    createdBy: authResult.userId,
  });

  await writeAdminAudit({
    actor: authResult.userId,
    action: "experiment.create",
    detail: `Created experiment: ${name}`,
    severity: "info",
  });

  return NextResponse.json(created, { status: 201 });
}
