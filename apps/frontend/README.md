# Buddhi Align Frontend

This is the Next.js App Router application for Buddhi Align.

It contains:

- The web UI for all practice modules
- API route handlers under `app/api/*`
- NextAuth setup and auth middleware
- Preferences, analytics, and data portability endpoints

## Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- NextAuth v5
- Vitest + Testing Library

## Run Locally

From repo root:

```bash
npm run dev:frontend
```

Or from this folder:

```bash
npm run dev
```

App URL: [http://localhost:3000](http://localhost:3000)

## Quality Commands

```bash
npm run lint
npm run test
npm run build
```

## Environment Variables

### Data

- `DATA_PROVIDER`: `supabase` (default) or `memory`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_API_URL` (optional; defaults to same-origin API routing)

### Authentication Variables

- `AUTH_SECRET`
- Optional URL hints: `AUTH_URL` / `NEXTAUTH_URL`
- Provider credentials:
  - `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`
  - `AUTH_MICROSOFT_ENTRA_ID`, `AUTH_MICROSOFT_ENTRA_SECRET`, optional `AUTH_MICROSOFT_ENTRA_TENANT_ID`
  - `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`
  - `AUTH_APPLE_ID`, `AUTH_APPLE_SECRET`, `AUTH_APPLE_KEY_ID`, `AUTH_APPLE_TEAM_ID`
  - `AUTH_FACEBOOK_ID`, `AUTH_FACEBOOK_SECRET`

Providers without required env vars are automatically excluded from the sign-in page.

### Background Music

- `NEXT_PUBLIC_BGM_URL`: single URL fallback/primary track
- `NEXT_PUBLIC_BGM_URLS`: comma-separated playlist URLs

Example:

```bash
NEXT_PUBLIC_BGM_URLS=https://cdn.pixabay.com/audio/2022/10/16/audio_12b5fae3b6.mp3,https://example.com/track-2.mp3
```

## API Routes in This App

### Module CRUD

- `GET /api/[module]`
- `POST /api/[module]`
- `PUT /api/[module]/[id]`
- `DELETE /api/[module]/[id]`

Supported module names: `karma`, `bhakti`, `jnana`, `dhyana`, `vasana`, `dharma`.

### Analytics and Data

- `GET /api/analytics`
- `GET /api/data/longitudinal`
- `GET /api/data/export`
- `POST /api/data/export`
- `GET /api/preferences`
- `PUT /api/preferences`
- `POST /api/obs`

### Auth

- `GET|POST /api/auth/[...nextauth]`

## Auth and Middleware Behavior

- Route protection is enforced by `middleware.ts`.
- Public paths include `/sign-in` and `/api/auth/*`.
- Anonymous users can explore with temporary in-memory data.

## i18n and Preferences

- Locale definitions live in `app/i18n/config.ts`.
- Preferences API stores locale + music control visibility.
- Local preferences are also mirrored in browser localStorage.

## Tests

- `app/page.test.tsx`
- `app/components/DataPortability.test.tsx`
- `app/components/LongitudinalChart.test.tsx`
- `../../packages/site-config/apiClient.test.ts`

## Related Docs

- Root project guide: `../../README.md`
- Improvement log: `../../IMPROVEMENTS.md`
