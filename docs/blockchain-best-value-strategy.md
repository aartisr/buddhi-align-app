# Best-Value Blockchain Strategy for buddhi-align-app

## Executive Summary

The highest-value use of blockchain for buddhi-align-app is not storing application data or running core product logic on-chain.

The highest-value use is an external trust-notarization layer for compliance attestations:

- keep evidence and sensitive data off-chain
- sign attestations off-chain
- anchor only immutable digests on-chain (or in an equivalent transparency log)

This approach creates third-party-verifiable tamper evidence for compliance and audit workflows while preserving privacy, performance, and portability.

## Why This Is the Best Value

### 1. Solves the Real Trust Gap

The main trust challenge for compliance is proving records were not modified after issuance. Digest anchoring directly addresses this by making post-facto tampering detectable.

### 2. Preserves Privacy by Design

Only digests and minimal metadata are anchored. No PII, no journal content, no secrets, and no full evidence payloads should be written on-chain.

### 3. Avoids Costly Misuse of Blockchain

Using blockchain as a primary data store increases cost, latency, and operational complexity without proportionate trust benefit for this app. Anchoring is low-frequency and high-impact.

### 4. Aligns with Open Standards

The attestation-first model aligns with widely adopted trust patterns in verifiable credentials, software provenance, and transparency-log ecosystems.

## Scope of What to Anchor

Anchor the following fields only:

- attestation digest
- issuer identifier
- anchor timestamp
- optional control-batch identifier
- optional release/environment label

Do not anchor:

- user records
- full evidence artifacts
- authentication/session details
- personal wellness or journaling data
- secrets or tokens

## Target Outcomes

- stronger external audit defensibility
- reduced dispute time on evidence integrity
- deterministic reproducibility of control evaluations
- increased partner and regulator confidence in compliance outputs

## Decision Framework

Use blockchain anchoring when all conditions are true:

- the record has high evidentiary value
- record frequency is moderate or low
- independent verification by external parties is valuable
- digest-based proof is sufficient (no on-chain business logic required)

Do not use blockchain anchoring when any condition is true:

- record contains sensitive personal content
- low-latency product behavior depends on chain confirmation
- benefit is primarily internal and can be satisfied by signed logs alone

## 90-Day Rollout Plan

### Phase 1 (Days 0-30): Baseline and Control

Goals:

- standardize attestation schema profile(s)
- establish trusted issuer registry and key-rotation policy
- define per-control anchoring requirements (required vs optional)

Deliverables:

- policy profile for Awaricon controls
- signing and verification runbook
- redaction and digesting policy

### Phase 2 (Days 31-60): Production Anchoring

Goals:

- publish digest anchors for high-criticality control batches
- support at least one backup anchoring backend (for resilience)
- automate verifier exports for auditors

Deliverables:

- anchor publication job
- anchor verification job
- signed compliance snapshot artifact

### Phase 3 (Days 61-90): Assurance and Optimization

Goals:

- formalize SLOs for attestation issuance and verification
- add independent replay checks and sampling audits
- reduce anchoring cost through batching and schedule tuning

Deliverables:

- KPI dashboard for integrity and verification outcomes
- quarterly trust review template
- incident response playbook for failed verification events

## KPI Model

Track these KPIs at minimum:

- attestation verification success rate: percentage of attestations that pass signature, issuer, validity, and digest-anchor checks
- audit replay determinism: percentage of replayed control evaluations that match original results
- evidence integrity dispute MTTR: mean time to resolve integrity disputes
- anchor publication SLO: percentage of required control batches anchored within target window
- anchor verification latency p95: 95th percentile verification time for external auditors
- cost per anchored batch: effective chain/transparency-log cost for each anchored compliance batch

Suggested initial targets:

- verification success rate >= 99.5%
- replay determinism = 100%
- anchor publication SLO >= 99.0%
- failed verification incident triage <= 4 hours

## Governance and Risk Controls

- key lifecycle management: enforce rotation, revocation checks, and signer separation of duties
- schema lifecycle management: version attestation schema and policy schema independently
- deterministic evaluation: pin evaluation timestamp for reproducible audit replays
- anti-correlation/privacy guardrails: avoid identifiers that increase cross-context correlation risk
- fallback strategy: if chain backend is degraded, queue anchors and preserve signed off-chain records for later publication

## Implementation Notes for This Repository

Current building blocks already support this strategy:

- attestation evaluator and model: apps/frontend/app/lib/compliance-attestation.ts
- API endpoint for evaluation: apps/frontend/app/api/admin/compliance/attestation/route.ts
- tests for evaluator and API route:
  - apps/frontend/app/lib/compliance-attestation.test.ts
  - apps/frontend/app/api/admin/compliance/attestation/route.test.ts

The strategic next step is operational hardening (issuer governance, anchoring backend adapters, replayable audit exports), not replacing the existing architecture.

## Summary

For buddhi-align-app, blockchain delivers best value as a narrow, high-trust integrity primitive:

- attest and evaluate off-chain
- anchor digests on-chain
- verify deterministically

This provides strong integrity evidence with minimal privacy risk, predictable performance, and framework portability.

## Operations Companion

For KPI instrumentation, ownership, and response playbooks, see `docs/blockchain-operational-runbook.md`.

For monthly budgeting and scenario-based spend planning, see `docs/blockchain-monthly-cost-model.md`.