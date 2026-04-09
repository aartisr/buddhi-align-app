import { NextRequest, NextResponse } from "next/server";

import { writeAdminAudit } from "@/app/admin/_audit";
import {
  evaluateComplianceControls,
  type AttestationEnvelope,
  type ComplianceControl,
} from "@/app/lib/compliance-attestation";
import { recordObservabilityEvent } from "@/app/lib/server-observability";
import { requireAdminApiAccess } from "../../_auth";

interface EvaluateComplianceRequest {
  controls: ComplianceControl[];
  attestations: AttestationEnvelope[];
  nowMs?: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isValidControl(value: unknown): value is ComplianceControl {
  if (!isRecord(value)) return false;
  if (typeof value.id !== "string") return false;
  if (typeof value.title !== "string") return false;
  if (typeof value.claimType !== "string") return false;
  if (!isStringArray(value.requiredClaimKeys)) return false;
  if (value.trustedIssuers !== undefined && !isStringArray(value.trustedIssuers)) return false;
  if (value.requireAnchor !== undefined && typeof value.requireAnchor !== "boolean") return false;
  return true;
}

function isValidAnchor(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return (
    typeof value.network === "string"
    && typeof value.transactionId === "string"
    && typeof value.digest === "string"
    && typeof value.anchoredAt === "string"
  );
}

function hasRequiredAttestationFields(value: Record<string, unknown>): boolean {
  return (
    typeof value.id === "string"
    && typeof value.scheme === "string"
    && typeof value.subject === "string"
    && typeof value.issuer === "string"
    && typeof value.issuedAt === "string"
    && typeof value.claimType === "string"
    && typeof value.digest === "string"
    && isRecord(value.claims)
  );
}

function hasValidOptionalAttestationFields(value: Record<string, unknown>): boolean {
  if (value.validUntil !== undefined && typeof value.validUntil !== "string") {
    return false;
  }

  if (value.anchors !== undefined) {
    if (!Array.isArray(value.anchors) || !value.anchors.every(isValidAnchor)) {
      return false;
    }
  }

  return true;
}

function isValidAttestation(value: unknown): value is AttestationEnvelope {
  if (!isRecord(value)) return false;

  if (!hasRequiredAttestationFields(value)) return false;
  return hasValidOptionalAttestationFields(value);
}

function parseEvaluateRequest(payload: unknown): EvaluateComplianceRequest | null {
  if (!isRecord(payload)) return null;

  if (!Array.isArray(payload.controls) || !payload.controls.every(isValidControl)) {
    return null;
  }

  if (!Array.isArray(payload.attestations) || !payload.attestations.every(isValidAttestation)) {
    return null;
  }

  if (payload.nowMs !== undefined && typeof payload.nowMs !== "number") {
    return null;
  }

  return {
    controls: payload.controls,
    attestations: payload.attestations,
    nowMs: payload.nowMs,
  };
}

export async function POST(req: NextRequest) {
  const authResult = await requireAdminApiAccess({ requireStepUp: true });
  if (!authResult.ok) return authResult.response;

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = parseEvaluateRequest(payload);
  if (!parsed) {
    return NextResponse.json(
      {
        error: "Invalid request. Expected { controls: ComplianceControl[], attestations: AttestationEnvelope[], nowMs?: number }.",
      },
      { status: 400 },
    );
  }

  const report = evaluateComplianceControls(parsed.controls, parsed.attestations, parsed.nowMs ?? Date.now());
  const failedControlIds = report.controls.filter((item) => !item.passed).map((item) => item.controlId);

  await writeAdminAudit({
    actor: authResult.userId,
    action: "compliance.attestation.evaluate",
    detail: `Evaluated ${report.totalCount} controls (${report.passedCount} passed, ${report.totalCount - report.passedCount} failed).`,
    severity: report.passed ? "info" : "warning",
  });

  await recordObservabilityEvent({
    event: "admin_compliance_evaluation_completed",
    source: "server",
    severity: report.passed ? "info" : "warning",
    statusCode: 200,
    userId: authResult.userId,
    data: {
      totalControls: report.totalCount,
      passedControls: report.passedCount,
      failedControlIds,
    },
  });

  return NextResponse.json(
    {
      generatedAt: new Date().toISOString(),
      report,
    },
    { status: 200 },
  );
}