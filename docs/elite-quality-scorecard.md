# Buddhi Align Elite Quality Scorecard

This scorecard defines the minimum release quality bar for Buddhi Align.
Every production release must pass all P0 gates.

## Gate Policy

- P0 gates: release-blocking. Any failure blocks deployment.
- P1 gates: strongly enforced. Failing two or more in one release blocks deployment.
- P2 goals: optimization targets tracked weekly.

## P0 Gates (Release Blocking)

### Engineering Correctness

- Lint: 0 errors.
- Tests: all tests pass.
- Build: production build succeeds.

Enforced by:

- npm run lint:frontend
- npm run test:frontend
- npm run build:frontend

### Frontend Performance

- Lighthouse budget check must pass via existing budget file.
- No performance-budget regression allowed on the default route.

Enforced by:

- npm run perf:ci

### Auth and Access Safety

- OIDC-required routes must reject non-OIDC sessions.
- Step-up protected routes must require recent authentication (default 15-minute freshness window).
- Export/import and admin APIs must enforce the policy server-side.

Enforced by tests:

- apps/frontend/app/auth/auth-confidence.test.ts
- apps/frontend/app/api/data/export/route.test.ts

### Data Protection

- Anonymous mode must not bypass authenticated persistence boundaries.
- User-isolation tests must pass for module and analytics APIs.

## P1 Gates (Strongly Enforced)

### Reliability

- No unresolved critical incidents in current release cycle.
- Error budget remaining at release time: >= 95%.
- Observability alerts on `/admin` must be reviewed before release, with no unresolved `critical` alert.

Alert thresholds (24h rolling window, configurable via env vars):

- Auth denials: `OBS_ALERT_AUTH_DENIALS_WARN` (default `5`), `OBS_ALERT_AUTH_DENIALS_CRITICAL` (default `10`)
- Data import issues: `OBS_ALERT_IMPORT_ISSUES_WARN` (default `3`), `OBS_ALERT_IMPORT_ISSUES_CRITICAL` (default `6`)
- Personalization issues: `OBS_ALERT_PERSONALIZATION_ISSUES_WARN` (default `4`), `OBS_ALERT_PERSONALIZATION_ISSUES_CRITICAL` (default `8`)

Alert taxonomy and ownership:

- `auth` → owner: `Identity & Access` → runbook: `RB-OBS-AUTH-01`
- `data` → owner: `Data Platform` → runbook: `RB-OBS-DATA-02`
- `personalization` → owner: `Recommendations` → runbook: `RB-OBS-P13N-03`

Operational dashboard expectations:

- `/admin` includes 7-day sparklines for auth denials and data import issues.
- Critical alerts trigger automatic incident creation with `system:observability` as actor.

### Product Experience

- Primary journaling flow remains usable in <= 20 seconds median completion time (manual UX QA for now).
- No accessibility blockers in keyboard navigation for sign-in and module entry flows.

### Security Posture

- Dependencies checked with npm audit in CI with no critical vulnerabilities.
- Secrets and provider credentials must remain outside source control.

## P2 Weekly Targets

- Core Web Vitals median:
  - LCP <= 2.0s
  - INP <= 200ms
  - CLS <= 0.1
- Test flake rate: < 1%.
- Regression escape rate: 0 P0 defects, <= 1 P1 defect per month.

## Release Gate Commands

Core gate (deterministic in local and restricted environments):

```bash
npm run quality:gate
```

Full release gate (includes performance budget checks):

```bash
npm run quality:gate:full
```

The full gate executes lint, tests, production build, and performance budget checks in sequence.

World-class certification gate:

```bash
npm run worldclass:gate
```

This adds dependency audit and checklist integrity verification.

See also:

- `docs/world-class-certification-checklist.md`

## Ownership and Cadence

- Engineering owner: maintains automated gates and test reliability.
- Product owner: validates UX and accessibility checkpoints.
- Review cadence: weekly scorecard review + pre-release gate verification.

## Escalation Rule

If any P0 gate fails:

1. Stop release.
2. Fix issue or rollback change.
3. Re-run full gate command.
4. Document root cause and preventive action in IMPROVEMENTS.md.
