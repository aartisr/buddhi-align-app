# Resilience and Quality Improvements

This file captures the current quality posture of Buddhi Align after the 2026 documentation refresh.

## Snapshot

- **Architecture**: Next.js-first app with in-app API routes
- **Storage abstraction**: `DataProvider` interface with `memory` and `supabase`
- **Auth**: NextAuth v5 with provider auto-detection from env vars
- **Quality gates**: lint, test, build in CI with Node 18.x and 20.x
- **Deployment target**: Netlify (`@netlify/plugin-nextjs`)

## Resilience Strengths

### 1. API client hardening

`packages/site-config/apiClient.ts` implements:

- request timeout
- retries with exponential backoff
- jitter to reduce synchronized retry spikes
- retryability checks for `408`, `429`, and `5xx`

### 2. Route-level validation and error handling

Next.js API routes validate request shape and return explicit status codes:

- malformed JSON -> `400`
- invalid module name -> `404`
- unauthorized preferences access -> `401`
- anonymous import attempt -> `403`
- unexpected failures -> `500`

### 3. Storage fallback flexibility

`packages/data-access/factory.ts` allows selecting:

- `DATA_PROVIDER=supabase` (default)
- `DATA_PROVIDER=memory`

This enables reliable local development even without external infrastructure.

### 4. Anonymous exploration mode

Anonymous mode can use temporary module data without account creation, while protected routes remain guarded by middleware and auth.

### 5. Data portability

`/api/data/export` supports:

- full archive export (JSON)
- import with per-module success/error reporting
- ID collision avoidance by stripping imported IDs and reassigning server-side

## Maintainability Strengths

### 1. Clear package boundaries

- `apps/frontend`: app UI + API routes + middleware + auth
- `packages/data-access`: storage interface + providers
- `packages/site-config`: API config/client + reusable hook layer
- `packages/shared-ui`: shared components

### 2. Single storage contract

The `DataProvider` interface (`list/create/update/delete`) keeps storage implementation details out of route handlers and module UI logic.

### 3. Script clarity

Workspace-level scripts map directly to frontend actions:

- `dev:frontend`
- `lint:frontend`
- `test:frontend`
- `build:frontend`

### 4. CI coverage of core flow

Workflow `.github/workflows/ci.yml` runs:

- lint
- tests
- build
- matrix for Node 18.x and 20.x
- optional security audit and coverage upload steps

## Genericity Strengths

### 1. Module-agnostic route pattern

Dynamic route handlers power all module CRUD APIs through the same route shape:

- `/api/[module]`
- `/api/[module]/[id]`

### 2. Config-driven auth provider availability

Provider metadata in `app/auth/provider-catalog.ts` enables adding/removing providers through env config without rewriting UI flow.

### 3. Pluggable music source configuration

Background music supports both single URL and playlist via:

- `NEXT_PUBLIC_BGM_URL`
- `NEXT_PUBLIC_BGM_URLS`

## Current Test Footprint

Current committed tests include:

- `apps/frontend/app/page.test.tsx`
- `apps/frontend/app/components/DataPortability.test.tsx`
- `apps/frontend/app/components/LongitudinalChart.test.tsx`
- `packages/site-config/apiClient.test.ts`

## Priority Next Improvements

1. Expand API route tests for auth/anonymous/data-provider edge cases.
2. Add integration tests for `/api/analytics`, `/api/preferences`, and `/api/data/longitudinal`.
3. Add contract tests for `DataProvider` implementations to guarantee parity between `memory` and `supabase`.
4. Add load/perf smoke checks for analytics routes before production traffic increases.
5. Introduce typed schema validation (for example Zod) in route handlers to simplify validation logic.

## Last Updated

2026-03-30
