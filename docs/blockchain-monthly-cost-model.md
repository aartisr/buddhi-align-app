# Blockchain Monthly Cost Model

## Purpose

This document provides a practical monthly cost model for digest anchoring in buddhi-align-app.

Use this model before enabling production anchoring and review it quarterly.

## What Drives Cost

1. Anchor frequency
- How many compliance batches are anchored per month.

2. Write cost per anchor
- Chain or transparency-log publication fee per anchor operation.

3. Provider and infrastructure costs
- RPC/API provider usage, managed services, and observability retention.

4. Verification workload
- Number of verification checks and their backend query costs.

## Base Formula

Monthly Anchoring Cost:

`monthly_anchoring_cost = anchors_per_month * avg_cost_per_anchor`

Total Monthly Operating Cost:

`total_monthly_cost = monthly_anchoring_cost + provider_cost + observability_cost + ops_overhead_cost`

Cost Per Anchored Batch:

`cost_per_anchored_batch = total_monthly_cost / anchored_batches_per_month`

## Scenario Model

These are planning scenarios, not guarantees. Replace assumptions with your real backend pricing.

### Scenario A: Low Volume Pilot

Assumptions:

- 100 anchored batches per month
- low-fee backend and batched publication
- minimal verification traffic

Estimated range:

- anchor fees: low
- infra/provider: low
- expected total: near-zero to low double digits monthly

Recommended for:

- first 30 to 60 days
- policy and reliability validation

### Scenario B: Moderate Production

Assumptions:

- 1,000 anchored batches per month
- mixed control criticality
- daily verification by operations and periodic external audits

Estimated range:

- anchor fees: low-to-moderate
- infra/provider: moderate
- expected total: low hundreds monthly (depending on backend)

Recommended for:

- steady-state with selective `requireAnchor=true` controls

### Scenario C: High Assurance / High Frequency

Assumptions:

- 10,000+ anchored batches per month
- high verification throughput and strict retention
- multi-backend redundancy

Estimated range:

- anchor fees: moderate-to-high
- infra/provider: moderate-to-high
- expected total: high hundreds to thousands monthly (backend dependent)

Recommended for:

- heavily regulated workloads requiring frequent notarization

## Cost Control Levers

1. Batch more aggressively
- Publish one anchor per control batch, not per artifact.

2. Anchor only required controls
- Use policy `requireAnchor` only where external tamper-evidence is necessary.

3. Use lower-fee backends for routine workloads
- Reserve expensive anchoring for high-criticality controls.

4. Limit verification fan-out
- Cache verification results for stable artifacts and use replay sampling.

5. Keep evidence off-chain
- Anchor digest + minimal metadata only.

## Budget Guardrails

Set and monitor these guardrails:

- monthly cost cap for anchoring services
- max allowed week-over-week cost growth (for example 20%)
- minimum value threshold for anchoring new control categories

When a guardrail is breached:

1. reduce anchor frequency for non-critical controls
2. increase batch size
3. move non-critical notarization to lower-cost backend
4. re-evaluate retention and verification cadence

## KPI Linkage

Track cost together with security value:

- `cost_per_anchored_batch`
- `anchor_publication_slo`
- `attestation_verification_success_rate`
- `anchor_verification_latency_p95`

Cost optimization should not degrade trust KPIs below policy thresholds.

## Monthly Review Template

Capture the following each month:

- anchored batches count
- anchor backend(s) used
- average and p95 anchor fee
- total provider/infra costs
- cost per anchored batch
- SLO and verification success trend
- actions for next month

## Repository Integration Points

- Strategy: docs/blockchain-best-value-strategy.md
- Runbook: docs/blockchain-operational-runbook.md
- KPI mapping: cost-per-batch section in runbook

## Summary

For this app, cost stays predictable when anchoring remains selective, batched, and policy-driven.

Start with low-volume pilot assumptions, then scale only where trust value justifies added spend.