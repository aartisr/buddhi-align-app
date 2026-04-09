# World-Class Certification Checklist

This checklist defines the enforceable bar for Buddhi Align to claim world-class engineering quality.
Every item below is implemented and mapped to an automated check, command, or workflow.

## Certification Rules

- A release is certifiable only when all Level 1 and Level 2 items pass.
- Level 3 items are operational controls that must remain in force for every release cycle.

## Level 1: Engineering Correctness

- [x] Strict lint policy for app code with complexity and maintainability constraints.
  - Evidence: `apps/frontend/.eslintrc.json`
  - Check: `npm run lint:frontend`

- [x] Type safety gate in CI.
  - Evidence: `.github/workflows/ci.yml` TypeScript type-check step
  - Check: `npx --prefix apps/frontend tsc --noEmit`

- [x] Unit and component test suite required for release.
  - Evidence: `apps/frontend/vitest.config.ts`, test files under `apps/frontend/app`
  - Check: `npm run test:frontend`

- [x] Production build required for release.
  - Evidence: release gate scripts and CI build steps
  - Check: `npm run build:frontend`

## Level 2: Performance, Security, and Reliability

- [x] Performance budgets enforced via Lighthouse and CWV budget check.
  - Evidence: `apps/frontend/lighthouse-budget.json`, `scripts/check-performance-budget.mjs`
  - Check: `npm run perf:ci`

- [x] Dependency risk gate for high and critical vulnerabilities.
  - Evidence: `package.json` script `security:audit`
  - Check: `npm run security:audit`

- [x] OIDC and step-up auth controls are documented and tested.
  - Evidence: `apps/frontend/docs/oidc-hardening-checklist.md`, `apps/frontend/app/auth/*.test.ts`
  - Check: included in `npm run test:frontend`

- [x] Observability and incident operations available in admin control center.
  - Evidence: `apps/frontend/app/admin/page.tsx`, `apps/frontend/app/admin/AdminDashboardView.tsx`
  - Check: built and type-checked as part of quality gate

## Level 3: Process and Governance

- [x] Scorecard policy with release-blocking gates documented.
  - Evidence: `docs/elite-quality-scorecard.md`

- [x] Component maintainability standards documented.
  - Evidence: `apps/frontend/docs/component-engineering-standards.md`

- [x] Checklist verification automated.
  - Evidence: `scripts/verify-world-class-checklist.mjs`
  - Check: `npm run checklist:verify`

## Combined Release Command

Use this as the single command to assert certification status:

```bash
npm run worldclass:gate
```

The command enforces lint, tests, build, performance budgets, dependency audit, and checklist integrity.
