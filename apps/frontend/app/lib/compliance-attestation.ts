export type AttestationScheme = "w3c-vc" | "in-toto" | "slsa" | "custom";

export interface AttestationAnchor {
  network: string;
  transactionId: string;
  digest: string;
  anchoredAt: string;
}

export interface AttestationEnvelope {
  id: string;
  scheme: AttestationScheme;
  subject: string;
  issuer: string;
  issuedAt: string;
  validUntil?: string;
  claimType: string;
  claims: Record<string, unknown>;
  digest: string;
  anchors?: AttestationAnchor[];
}

export interface ComplianceControl {
  id: string;
  title: string;
  claimType: string;
  requiredClaimKeys: string[];
  trustedIssuers?: string[];
  requireAnchor?: boolean;
}

export interface ControlEvaluation {
  controlId: string;
  passed: boolean;
  reasons: string[];
  evidenceAttestationIds: string[];
}

export interface ComplianceEvaluationReport {
  passed: boolean;
  passedCount: number;
  totalCount: number;
  controls: ControlEvaluation[];
}

function parseDateMs(value?: string): number | null {
  if (!value) return null;
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return null;
  return parsed;
}

export function isAttestationValidNow(
  attestation: AttestationEnvelope,
  nowMs: number = Date.now(),
): boolean {
  const issuedAtMs = parseDateMs(attestation.issuedAt);
  if (issuedAtMs === null || issuedAtMs > nowMs) {
    return false;
  }

  const validUntilMs = parseDateMs(attestation.validUntil);
  if (validUntilMs !== null && nowMs > validUntilMs) {
    return false;
  }

  return true;
}

export function isAnchorPresent(attestation: AttestationEnvelope): boolean {
  const anchors = attestation.anchors ?? [];
  return anchors.some((anchor) => anchor.digest === attestation.digest);
}

function hasAllClaims(attestation: AttestationEnvelope, requiredClaimKeys: string[]): boolean {
  return requiredClaimKeys.every((key) => Object.prototype.hasOwnProperty.call(attestation.claims, key));
}

export function evaluateControl(
  control: ComplianceControl,
  attestations: AttestationEnvelope[],
  nowMs: number = Date.now(),
): ControlEvaluation {
  const matching = attestations.filter((attestation) => attestation.claimType === control.claimType);

  const reasons: string[] = [];
  const evidenceAttestationIds: string[] = [];

  for (const attestation of matching) {
    if (!isAttestationValidNow(attestation, nowMs)) {
      reasons.push(`Attestation ${attestation.id} is expired or not yet valid.`);
      continue;
    }

    if (control.trustedIssuers && !control.trustedIssuers.includes(attestation.issuer)) {
      reasons.push(`Attestation ${attestation.id} issuer ${attestation.issuer} is not trusted for control ${control.id}.`);
      continue;
    }

    if (!hasAllClaims(attestation, control.requiredClaimKeys)) {
      reasons.push(`Attestation ${attestation.id} does not include all required claims for control ${control.id}.`);
      continue;
    }

    if (control.requireAnchor && !isAnchorPresent(attestation)) {
      reasons.push(`Attestation ${attestation.id} does not include a matching blockchain anchor digest.`);
      continue;
    }

    evidenceAttestationIds.push(attestation.id);
  }

  if (evidenceAttestationIds.length > 0) {
    return {
      controlId: control.id,
      passed: true,
      reasons: [],
      evidenceAttestationIds,
    };
  }

  if (matching.length === 0) {
    reasons.push(`No attestation found for claim type ${control.claimType}.`);
  }

  return {
    controlId: control.id,
    passed: false,
    reasons,
    evidenceAttestationIds: [],
  };
}

export function evaluateComplianceControls(
  controls: ComplianceControl[],
  attestations: AttestationEnvelope[],
  nowMs: number = Date.now(),
): ComplianceEvaluationReport {
  const evaluations = controls.map((control) => evaluateControl(control, attestations, nowMs));
  const passedCount = evaluations.filter((item) => item.passed).length;

  return {
    passed: passedCount === controls.length,
    passedCount,
    totalCount: controls.length,
    controls: evaluations,
  };
}
