# PostHog integration

Buddhi Align sends a small, curated set of product events to PostHog without loading a third-party analytics SDK into the page. This keeps the integration lightweight, avoids automatic capture and session replay, and reuses the app's existing event vocabulary.

## Enable it

Set these deployment environment variables, then redeploy:

```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_your_project_key
# Optional. The US ingestion host is the default.
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

Use `https://eu.i.posthog.com` for an EU PostHog project, or your HTTPS self-hosted ingestion host. When the key is absent, the integration is completely dormant.

## What is collected

The integration forwards only events the application intentionally emits through `app/lib/logEvent.ts`, including page views, web-vitals measurements, module actions, and explicit calls to action. Events are sent in small batches and use a random per-browser-session identifier. It does not enable autocapture, session replay, feature flags, user profiles, cookies, or user identification.

The configured ingestion host is added to the app's `connect-src` Content Security Policy. Keep the host HTTPS and do not expose any server-side PostHog secrets through `NEXT_PUBLIC_*` variables.

## Privacy and product decisions

Before enabling analytics in production, confirm the required privacy notice, consent flow, retention policy, and regional data-residency settings with the organization responsible for the deployment. If a future product requirement needs account-level analytics, add explicit consent before calling PostHog's identify/reset APIs; this integration deliberately does not do so by default.

For PostHog project setup and dashboard use, see the official [JavaScript web documentation](https://posthog.com/docs/libraries/js).
