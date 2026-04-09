# Buddhi Align App

> Buddhi Yoga as a practical system for clarity, self-regulation, and purposeful daily action.

[![Shishu Bharati Logo](https://www.shishubharati.net/wp-content/uploads/2024/07/ShishuBharati-Logo-Transparent-HiRes-150x150.png)](https://www.shishubharati.net/)

![Awaricon Platinum Readiness](https://img.shields.io/badge/Awaricon-Platinum%20Readiness-E5E4E2?style=for-the-badge&logo=sparkle&logoColor=1f2937&labelColor=8a8f98)

Certification target: ForeverLotus Awaricon Platinum.

This project is dedicated to **Shishubharati**.

Website: [https://www.shishubharati.net/](https://www.shishubharati.net/)

## Documentation Status

This documentation was refreshed on **2026-03-30** to match the current codebase.

## What This App Is

Buddhi Align is a monorepo centered on a Next.js App Router application that helps users build contemplative practice through structured modules:

- Karma Yoga
- Bhakti Journal
- Jnana Reflection
- Dhyana Meditation
- Vasana Tracker
- Dharma Planner
- Motivation and Analytics

It includes built-in API routes, optional anonymous mode, OAuth sign-in, data portability, and longitudinal analytics.

## Current Architecture

```text
apps/
  frontend/                Next.js 14 app (UI + API routes + auth + middleware)
packages/
  data-access/             DataProvider interface + memory/supabase implementations
  site-config/             API client/config utilities + reusable hooks
  shared-ui/               Shared React UI components
supabase/
  schema.sql               Core schema
  schema_user_scoped.sql   User-scoped/RLS-oriented schema variant
```

Note: There is no standalone `apps/backend` service in this repository. API behavior is implemented via Next.js route handlers under `apps/frontend/app/api`.

## Tech Stack

- Next.js 14 (App Router)
- React 18 + TypeScript
- Tailwind CSS
- NextAuth v5 (OAuth)
- Vitest + Testing Library
- npm workspaces

## Quick Start

### Prerequisites

- Node.js 20.x (repo engines target)
- npm 9+

### Install

```bash
npm install
```

Create local env file from the template:

```bash
cp .env.example apps/frontend/.env.local
```

### Start local development

```bash
npm run dev
```

Open: [http://localhost:3000](http://localhost:3000)

## Workspace Scripts

Run from repository root:

- `npm run dev` / `npm run dev:frontend`: start frontend dev server
- `npm run lint` / `npm run lint:frontend`: run frontend linting
- `npm run test` / `npm run test:frontend`: run frontend tests
- `npm run build` / `npm run build:frontend`: build frontend

Recommended local quality loop:

```bash
npm run lint && npm run test && npm run build
```

## Environment Variables

Use `.env.example` as the canonical template and place runtime values in `apps/frontend/.env.local`.

Core runtime variables used by the app:

- `DATA_PROVIDER`: `supabase` (default) or `memory`
- `SUPABASE_URL`: required when `DATA_PROVIDER=supabase`
- `SUPABASE_SERVICE_ROLE_KEY`: required when `DATA_PROVIDER=supabase`
- `NEXT_PUBLIC_API_URL`: optional API origin override (defaults to same origin)
- `NEXT_PUBLIC_SITE_URL`: canonical public origin (recommended in production)
- `ADMIN_PASSWORD`: password used to unlock the admin-only module at `/admin`
- `NEXT_PUBLIC_BGM_URL`: optional single background music URL
- `NEXT_PUBLIC_BGM_URLS`: optional comma-separated background music playlist

Auth variables:

- `AUTH_SECRET`
- `AUTH_URL` or `NEXTAUTH_URL` (optional in development; production derives host from request headers)
- `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`
- `AUTH_MICROSOFT_ENTRA_ID`, `AUTH_MICROSOFT_ENTRA_SECRET`, optional `AUTH_MICROSOFT_ENTRA_TENANT_ID`
- `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`
- `AUTH_APPLE_ID`, `AUTH_APPLE_SECRET`, `AUTH_APPLE_KEY_ID`, `AUTH_APPLE_TEAM_ID`
- `AUTH_FACEBOOK_ID`, `AUTH_FACEBOOK_SECRET`

If provider credentials are missing, that provider is automatically omitted from sign-in options.

## White-Label and Generic Setup

This repository is intentionally modular and can be adapted for different brands or organizations.

- Replace app name, logos, and copy in UI components without changing module APIs.
- Keep module route names stable (`/karma-yoga`, `/jnana-reflection`, etc.) to avoid breaking links.
- Keep `packages/data-access` provider interfaces unchanged so storage backends remain plug-and-play.
- Use `DATA_PROVIDER=memory` for zero-infra local startup, then switch to `supabase` for persistent environments.

## API Surface

### Module CRUD

Valid modules:

- `karma`
- `bhakti`
- `jnana`
- `dhyana`
- `vasana`
- `dharma`

Routes:

- `GET /api/[module]`
- `POST /api/[module]`
- `PUT /api/[module]/[id]`
- `DELETE /api/[module]/[id]`

### Additional routes

- `GET /api/analytics`: streaks, counts, most active module, today activity
- `GET /api/data/longitudinal`: 8-week trend + consistency score + growth module
- `GET /api/data/export`: export module data archive
- `POST /api/data/export`: import module data archive (disabled in anonymous mode)
- `GET /api/preferences`: user preference fetch (requires auth)
- `PUT /api/preferences`: user preference update (requires auth)
- `POST /api/obs`: lightweight observability event ingestion
- `GET|POST /api/auth/[...nextauth]`: NextAuth endpoints

## Auth and Anonymous Mode

- Middleware protects routes by default.
- Public routes include `/sign-in` and `/api/auth/*`.
- Anonymous mode can be used for exploration and stores temporary data in an in-memory anonymous store.
- Signed-in users persist through configured `DataProvider` storage.

## Data Providers

`packages/data-access` defines a storage abstraction:

- `InMemoryDataProvider`: local/ephemeral storage
- `SupabaseDataProvider`: persistent storage via Supabase

Default selection is controlled by `DATA_PROVIDER` in `packages/data-access/factory.ts`.

## Testing and CI

Current tests include:

- `apps/frontend/app/page.test.tsx`
- `apps/frontend/app/components/DataPortability.test.tsx`
- `apps/frontend/app/components/LongitudinalChart.test.tsx`
- `packages/site-config/apiClient.test.ts`

CI workflow (`.github/workflows/ci.yml`) runs:

- Lint (`npm run lint:frontend`)
- Tests (`npm run test:frontend`)
- Build (`npm run build:frontend`)
- Matrix: Node 18.x and 20.x
- Security audit and coverage upload steps

## Deployment

The included `netlify.toml` deploys `apps/frontend` with `@netlify/plugin-nextjs`.

For Vercel deployment, use the existing root-level `vercel.json` and configure these project settings in Vercel:

- Framework preset: `Next.js`
- Root directory: repository root
- Build command: from `vercel.json` (already configured)
- Install command: from `vercel.json` (already configured)

Recommended Vercel environment variables:

- `NEXT_PUBLIC_SITE_URL` = your production domain (for canonical metadata + sitemap)
- `DATA_PROVIDER`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `AUTH_SECRET`
- Any OAuth provider secrets you plan to enable

## Admin Module

The app includes a protected admin workflow:

- `GET /admin-access` unlock page (requires signed-in user + `ADMIN_PASSWORD`)
- `GET /admin` admin control center (requires signed-in user + valid admin cookie)

Admin capabilities include:

- Aggregate module footprint and reliability snapshot
- Incident logging workflow
- Experiment planning workflow
- Immutable-style audit feed stored via data provider

Admin API endpoints (server-protected):

- `GET /api/admin/overview`
- `POST /api/admin/incident`
- `POST /api/admin/experiment`

Deployment notes:

- Build is executed from workspace root.
- Next.js API routes and middleware are converted into Netlify Functions / Edge Functions.
- `DATA_PROVIDER=supabase` is expected for hosted environments unless intentionally overridden.

## Related Docs

- Frontend-specific guide: `apps/frontend/README.md`
- Quality and resilience notes: `IMPROVEMENTS.md`
- Elite quality scorecard: `docs/elite-quality-scorecard.md`
- World-class certification checklist: `docs/world-class-certification-checklist.md`
- Music shortlist: `docs/spiritual-music-shortlist.md`
- Music source comparison: `docs/spiritual-music-source-comparison.md`

## License

ISC
