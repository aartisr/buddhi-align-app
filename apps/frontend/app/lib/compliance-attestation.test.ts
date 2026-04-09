import { describe, expect, it } from "vitest";

import {
  evaluateComplianceControls,
  evaluateControl,
  isAnchorPresent,
  isAttestationValidNow,
  type AttestationEnvelope,
  type ComplianceControl,
} from "./compliance-attestation";

const NOW = Date.parse("2026-04-09T12:00:00.000Z");

function makeAttestation(overrides?: Partial<AttestationEnvelope>): AttestationEnvelope {
  return {
    id: "att-1",
    scheme: "w3c-vc",
    subject: "service:frontend",
    issuer: "did:example:auditor",
    issuedAt: "2026-04-01T00:00:00.000Z",
    validUntil: "2026-05-01T00:00:00.000Z",
    claimType: "control.auth.oidc",
    claims: {
      providerPolicy: "oidc-only",
      stepUpWindowMinutes: 15,
    },
    digest: "sha256:abc123",
    anchors: [
      {
        network: "polygon",
        transactionId: "0xabc",
        digest: "sha256:abc123",
        anchoredAt: "2026-04-01T01:00:00.000Z",
      },
    ],
    ...overrides,
  };
}

describe("compliance-attestation", () => {
  it("validates attestation temporal boundaries", () => {
    expect(isAttestationValidNow(makeAttestation(), NOW)).toBe(true);
    expect(isAttestationValidNow(makeAttestation({ validUntil: "2026-04-02T00:00:00.000Z" }), NOW)).toBe(false);
    expect(isAttestationValidNow(makeAttestation({ issuedAt: "2026-04-10T00:00:00.000Z" }), NOW)).toBe(false);
  });

  it("checks for matching blockchain anchor digest", () => {
    expect(isAnchorPresent(makeAttestation())).toBe(true);
    expect(
      isAnchorPresent(
        makeAttestation({
          anchors: [{ network: "polygon", transactionId: "0xdef", digest: "sha256:other", anchoredAt: "2026-04-01T01:00:00.000Z" }],
        }),
      ),
    ).toBe(false);
  });

  it("evaluates one control with trusted issuer and required claims", () => {
    const control: ComplianceControl = {
      id: "AWA-CTRL-01",
      title: "OIDC and step-up policy",
      claimType: "control.auth.oidc",
      requiredClaimKeys: ["providerPolicy", "stepUpWindowMinutes"],
      trustedIssuers: ["did:example:auditor"],
      requireAnchor: true,
    };

    const result = evaluateControl(control, [makeAttestation()], NOW);
    expect(result.passed).toBe(true);
    expect(result.evidenceAttestationIds).toEqual(["att-1"]);
  });

  it("returns report summary across multiple controls", () => {
    const controls: ComplianceControl[] = [
      {
        id: "AWA-CTRL-01",
        title: "OIDC and step-up policy",
        claimType: "control.auth.oidc",
        requiredClaimKeys: ["providerPolicy", "stepUpWindowMinutes"],
        trustedIssuers: ["did:example:auditor"],
        requireAnchor: true,
      },
      {
        id: "AWA-CTRL-02",
        title: "Supply-chain provenance",
        claimType: "control.supplychain.provenance",
        requiredClaimKeys: ["buildSystem", "sourceRevision"],
        requireAnchor: false,
      },
    ];

    const report = evaluateComplianceControls(controls, [makeAttestation()], NOW);
    expect(report.passed).toBe(false);
    expect(report.passedCount).toBe(1);
    expect(report.totalCount).toBe(2);
    expect(report.controls[1]?.reasons.join(" ")).toContain("No attestation found");
  });
});
