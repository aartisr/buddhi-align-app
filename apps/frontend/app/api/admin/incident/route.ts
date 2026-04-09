import { NextRequest, NextResponse } from "next/server";

import { createDataProvider } from "@buddhi-align/data-access";
import { requireAdminApiAccess } from "../_auth";
import { writeAdminAudit } from "@/app/admin/_audit";

const ADMIN_INCIDENT_MODULE = "__admin_incident";

interface AdminIncidentEntry {
  id: string;
  title: string;
  severity: "info" | "warning" | "critical";
  status: "open" | "resolved";
  note?: string;
  createdAt: string;
  createdBy: string;
  [key: string]: unknown;
}

export async function POST(req: NextRequest) {
  const authResult = await requireAdminApiAccess({ requireStepUp: true });
  if (!authResult.ok) return authResult.response;

  let body: Partial<AdminIncidentEntry>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const title = String(body.title ?? "").trim();
  const severity = body.severity;
  const note = typeof body.note === "string" ? body.note.trim() : "";

  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  if (!severity || !["info", "warning", "critical"].includes(severity)) {
    return NextResponse.json({ error: "severity must be info, warning, or critical" }, { status: 400 });
  }

  const provider = createDataProvider();
  const created = await provider.create<AdminIncidentEntry>(ADMIN_INCIDENT_MODULE, {
    title,
    severity,
    status: "open",
    note,
    createdAt: new Date().toISOString(),
    createdBy: authResult.userId,
  });

  await writeAdminAudit({
    actor: authResult.userId,
    action: "incident.create",
    detail: `Logged ${severity} incident: ${title}`,
    severity: severity === "critical" ? "critical" : "warning",
  });

  return NextResponse.json(created, { status: 201 });
}
