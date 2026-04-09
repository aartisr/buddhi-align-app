# Generic Blockchain Trust and Attestation Model

This document defines a generic, reusable trust architecture for compliance programs (including Awaricon) without locking implementation to one framework or one blockchain.

## Design Goals

- Use attestations as the source of compliance truth.
- Use blockchain only as a tamper-evidence anchor.
- Keep control mapping policy-driven so the same implementation can support multiple standards.

## Core Model

1. Evidence
- Raw artifacts from CI/CD, runtime checks, audits, scans, and approvals.
- Stored off-chain.

2. Attestations
- Signed claims over evidence and control outcomes.
- Recommended formats: W3C VC, in-toto, SLSA attestations.
- Stored off-chain with immutable digest.

3. Anchors
- On-chain records include digest + timestamp + locator metadata only.
- Never place secrets, PII, or full evidence on-chain.

4. Policy Controls
- Machine-readable control definitions map claim types to compliance controls.
- Example controls: auth hardening, incident response, provenance, vulnerability posture.

5. Verification
- Validate signature, issuer trust, validity window, and anchor consistency.
- Produce deterministic control pass/fail report.

## Why This Is Generic

- Compliance-framework agnostic: controls are data, not hardcoded logic.
- Blockchain agnostic: anchors are adapter-based (Ethereum L2, Hyperledger, or transparency log).
- Issuer agnostic: supports DID/PKI trust registries.

## Reference Implementation in This Repo

- Evaluator and types: `apps/frontend/app/lib/compliance-attestation.ts`
- Unit tests: `apps/frontend/app/lib/compliance-attestation.test.ts`

The evaluator intentionally separates:

- trust checks (issuer, validity, anchor)
- compliance checks (required claim presence and claim type mapping)

## Awaricon Mapping Pattern

Use Awaricon as a policy profile, not a code branch:

- Define `ComplianceControl[]` with Awaricon control IDs.
- Issue attestations with matching `claimType` values.
- Evaluate controls against current attestations.
- Publish control report and supporting evidence links.

This preserves portability to additional frameworks (SOC 2, ISO 27001, NIST) by changing policy definitions only.

## Operational Recommendations

- Rotate attestation signing keys and enforce revocation checks.
- Version attestation schema separately from policy schema.
- Keep anchors optional per-control (not all controls need blockchain proof).
- Keep verification deterministic and auditable.

## Key Caveat

Blockchain improves tamper evidence, not semantic correctness.
Truth still depends on trusted issuers and high-quality evidence collection.
