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

Create local environment values first:

```bash
cp ../../.env.example .env.local
```

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
- `NEXT_PUBLIC_OBSERVABILITY_CLIENT` (optional; set to `1` to enable client telemetry posts)
- `NEXT_PUBLIC_OBSERVABILITY_SAMPLE_RATE` (optional; `0..1`, defaults to `1` when telemetry is enabled)
- `NEXT_PUBLIC_CLARITY_PROJECT_ID` (optional; when set, initializes Microsoft Clarity on the client)

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

When exactly one OAuth provider is configured, the sign-in route auto-forwards users to that provider for near one-tap access.
Use `/sign-in?mode=manual` to force the provider-choice screen.

### Background Music

- `NEXT_PUBLIC_BGM_URL`: single URL fallback/primary track
- `NEXT_PUBLIC_BGM_URLS`: comma-separated playlist URLs

Example:

```bash
NEXT_PUBLIC_BGM_URLS=https://cdn.pixabay.com/audio/2022/10/16/audio_12b5fae3b6.mp3,https://example.com/track-2.mp3
```

### Community Integration (Feature-Flagged, Plug-and-Play)

- `COMMUNITY_INTEGRATION_PROVIDER`: `none` (default) or `discourse`
- Legacy compatibility: `DISCOURSE_INTEGRATION_ENABLED=true` also enables the Discourse provider when explicit provider is unset
- `DISCOURSE_BASE_URL`: Discourse instance base URL (required when enabled)
- `NEXT_PUBLIC_DISCOURSE_COMMUNITY_URL`: public community URL for client-side links. Use the Buddhi Align origin, for example `https://buddhi-align.foreverlotus.com/community`, so module CTAs stay in the same tab.
- `COMMUNITY_PROXY_TARGET`: optional external proxy destination used by Next.js rewrites for `/community`. Leave this unset for the native in-app community pages.
- `DISCOURSE_PARENT_CATEGORY_SLUG`: optional parent category slug; when set, links resolve as `/c/<parent>/<subcategory>`
- `DISCOURSE_API_USERNAME`: API user for server-side Discourse calls
- `DISCOURSE_API_KEY`: API key for server-side Discourse calls
- `DISCOURSE_SSO_SECRET`: signing secret for Discourse SSO (Phase 3)
- `DISCOURSE_SSO_DEFAULT_GROUPS`: comma-separated groups added for every SSO user
- `DISCOURSE_SSO_ADMIN_GROUPS`: comma-separated groups added when app admin cookie is present
- `DISCOURSE_SSO_MODERATOR_GROUPS`: comma-separated groups added when app admin cookie is present
- `DISCOURSE_SSO_ALLOWED_GROUPS`: optional comma-separated allowlist; when set, only listed groups may be emitted
- `DISCOURSE_SSO_DENIED_GROUPS`: optional comma-separated denylist; denied groups are always filtered out
- `DISCOURSE_SSO_GRANT_ADMIN_FROM_APP_ADMIN`: `true` to set Discourse `admin=true` for app admins
- `DISCOURSE_SSO_GRANT_MODERATOR_FROM_APP_ADMIN`: `true` to set Discourse `moderator=true` for app admins
- `DISCOURSE_SSO_GROUP_SYNC_MODE`: `add` (default, only appends groups) or `sync` (sets full `groups` list on each login)
- `DISCOURSE_DEFAULT_CATEGORY_SLUG`: optional default category slug
- `DISCOURSE_REQUEST_TIMEOUT_MS`: optional timeout override for server requests

Native community note:
- `/community`, `/community/c/...`, and `/community/t/...` are Buddhi Align pages that read Discourse JSON server-side and keep users inside the app for browsing.
- Set `NEXT_PUBLIC_DISCOURSE_COMMUNITY_URL` to the Buddhi Align `/community` URL and leave `COMMUNITY_PROXY_TARGET` unset.
- Only set `COMMUNITY_PROXY_TARGET` if you intentionally want a full Discourse reverse proxy and Discourse is configured to serve under `/community`; that bypasses the native pages.
- Community links will preserve that base path and resolve as:
  - `/community/c/<subcategory>`
  - `/community/c/<parent>/<subcategory>` when `DISCOURSE_PARENT_CATEGORY_SLUG` is set.
- On Vercel, configure the same community variables in Project Settings. Keep `DISCOURSE_API_KEY` and `DISCOURSE_SSO_SECRET` as protected environment variables, not in `vercel.json`.
- Other websites can promote the same community with the embeddable script at `/community-widget.js`; see `docs/discourse-reverse-proxy-setup.md` for the snippet.

## Invite And Growth UX

- Home and sign-in screens include an invite widget for rapid sharing.
- Users can invite friends through:
  - Email (`mailto:`)
  - SMS (`sms:`)
  - Copy link
  - Native share sheet (when supported by browser/device)
- Invite links are deep links with onboarding/context params (for example module-specific links).
- Auth middleware preserves deep-link query params in `callbackUrl`, so users return to the exact invite destination after sign-in.

### Discourse SSO (DiscourseConnect)

To complete SSO, configure your Discourse admin settings:

- Enable `discourse connect`
- Set `discourse connect secret` to the same value as `DISCOURSE_SSO_SECRET`
- Set `discourse connect url` to:
  - `http://localhost:3000/api/community/discourse/sso` (local)
  - `https://<your-app-domain>/api/community/discourse/sso` (production)

The app validates the incoming signed payload (`sso` + `sig`), requires a signed-in user, and redirects back to Discourse with a signed user payload.

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
- OIDC hardening checklist: `docs/oidc-hardening-checklist.md`
- Component/page engineering standards: `docs/component-engineering-standards.md`
- Refactor hotspot backlog: `docs/refactor-hotspot-backlog.md`
- Community integration phased plan: `docs/discourse-integration-phased-plan.md`
- Discourse reverse proxy setup: `docs/discourse-reverse-proxy-setup.md`
