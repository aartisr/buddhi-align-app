# Blockchain Compliance Operational Runbook

## Purpose

This one-page runbook maps blockchain-compliance KPIs to concrete telemetry fields, API/report artifacts, owners, and response playbooks.

This runbook assumes the trust model already documented in:

- docs/blockchain-best-value-strategy.md
- docs/blockchain-trust-attestation-generic.md

## System Components in Scope

- Evaluation API: `POST /api/admin/compliance/attestation`
- Evaluation response artifact: `generatedAt` and `report`
- Observability event: `admin_compliance_evaluation_completed`
- Admin audit action: `compliance.attestation.evaluate`

## KPI to Signal Mapping

### 1) Attestation Verification Success Rate

Definition:

- Percentage of attestation evaluations where all controls pass trust and compliance checks.

Primary source fields:

- API response: `report.passed`, `report.passedCount`, `report.totalCount`
- Observability event data: `totalControls`, `passedControls`, `failedControlIds`

Computation:

- Per evaluation pass ratio: `passedControls / totalControls`
- Fleet KPI: average pass ratio across evaluation windows, plus count of full-pass evaluations.

Owner:

- Security Engineering

Alert threshold:

- Trigger warning if full-pass rate drops below 99.5% over rolling 7 days.

### 2) Audit Replay Determinism

Definition:

- Percentage of replayed evaluations that produce identical control outcomes.

Primary source fields:

- Request replay inputs: `controls`, `attestations`, `nowMs`
- API response: full `report` payload

Computation:

- Replay the same request with fixed `nowMs`.
- Determinism is met when `report` is byte-equivalent (or semantically equivalent by control ID and pass/fail).

Owner:

- Compliance Platform

Alert threshold:

- Any mismatch is a Sev-2 investigation candidate.

### 3) Evidence Integrity Dispute MTTR

Definition:

- Mean time to resolve integrity disputes from open to closure.

Primary source fields:

- Admin audit entries with action `compliance.attestation.evaluate`
- Incident records linked to disputed `failedControlIds`

Computation:

- MTTR = average(`resolution_timestamp - dispute_open_timestamp`)

Owner:

- Compliance Operations

Alert threshold:

- Trigger escalation if MTTR exceeds 24 hours for high-severity disputes.

### 4) Anchor Publication SLO

Definition:

- Percentage of required control batches anchored within target publication window.

Primary source fields:

- Attestation envelope anchor metadata: `anchors[].network`, `anchors[].transactionId`, `anchors[].digest`, `anchors[].anchoredAt`
- Policy flag in control definitions: `requireAnchor`

Computation:

- Required set: controls where `requireAnchor = true`
- SLO numerator: required controls with matching digest anchor published in time window
- SLO denominator: all required controls evaluated in window

Owner:

- Platform Reliability

Alert threshold:

- Warning below 99.0% daily; page below 98.0%.

### 5) Anchor Verification Latency p95

Definition:

- 95th percentile time to complete digest-anchor verification for external/audit checks.

Primary source fields:

- Verification workflow timing around `isAnchorPresent` checks and chain/transparency-log lookups
- Optional custom timer metric in observability backend

Computation:

- p95 over completed verification operations per day.

Owner:

- Platform Reliability

Alert threshold:

- Warning above 2 seconds p95 for two consecutive windows.

### 6) Cost per Anchored Batch

Definition:

- Effective anchoring cost per compliance batch.

Primary source fields:

- Anchor transaction fee/cost from chain backend
- Count of batches with successful anchors

Computation:

- `total_anchor_cost / anchored_batch_count`

Owner:

- FinOps + Platform

Alert threshold:

- Warning when cost rises 20% week-over-week without security benefit increase.

## Operational Queries and Artifacts

### Required Artifacts per Evaluation

- Signed request payload snapshot (`controls`, `attestations`, optional `nowMs`)
- API response snapshot (`generatedAt`, `report`)
- Observability event record (`admin_compliance_evaluation_completed`)
- Admin audit entry (`compliance.attestation.evaluate`)

### Minimum Retention Guidance

- Keep evaluation response and observability summaries for at least one audit cycle.
- Keep anchor metadata references as long as corresponding compliance evidence is in retention.

## Incident Playbooks

### Playbook A: Sudden Drop in Verification Success Rate

1. Identify top failing control IDs from `failedControlIds`.
2. Determine if failures are issuer trust, validity window, claim schema, or anchor mismatches.
3. Roll back recent policy/schema changes if blast radius is broad.
4. Re-run deterministic replay with fixed `nowMs` to confirm stability.

### Playbook B: Determinism Failure

1. Compare replay inputs for drift (especially timestamps and claim payloads).
2. Verify that `nowMs` is fixed in replay workflow.
3. Confirm no non-deterministic enrichment step was introduced.
4. Open Sev-2 if mismatch persists after controlled replay.

### Playbook C: Anchor Publication SLO Breach

1. Check chain/transparency-log backend health.
2. Queue delayed anchors and publish backlog with ordered timestamps.
3. Mark controls as pending-anchor only where policy allows.
4. Publish incident note and expected catch-up time.

## Weekly Operating Cadence

1. Review KPI dashboard and outliers.
2. Review top 10 failed control IDs by frequency.
3. Verify deterministic replay sample set.
4. Review anchor cost trend and batching efficiency.
5. Confirm no retention or privacy policy drift.

## File References

- Evaluation API route: apps/frontend/app/api/admin/compliance/attestation/route.ts
- Evaluator logic: apps/frontend/app/lib/compliance-attestation.ts
- Strategy document: docs/blockchain-best-value-strategy.md
- Generic architecture document: docs/blockchain-trust-attestation-generic.md
- Monthly cost planning: docs/blockchain-monthly-cost-model.md