# Community Integration: Phased Delivery Plan

## Objective

Build a production-safe community integration architecture that improves retention and accountability for practice modules while preserving privacy boundaries and operational control.

## Non-Goals

- No migration of private journal content into Discourse.
- No forced social experience for users who prefer solo practice.
- No hard dependency on Discourse uptime for core module usage.

## Delivery Principles

- Feature-flag everything and keep core app paths independent.
- Start read-only and opt-in before bi-directional sync.
- Protect personal reflection data by default and share only explicit user-approved summaries.
- Instrument every phase with measurable adoption and safety metrics.

## Phase 1: Foundation and Safety Rails (Implemented)

### Phase 1 Scope

- Add typed server config for a provider-based community integration.
- Add runtime validation helpers for required environment variables.
- Keep integration fully disabled by default via feature flag.
- Add test coverage for config parsing and validation behavior.

### Phase 1 Exit Criteria

- Community provider config can be parsed safely in all environments.
- Enabling the flag without mandatory variables produces deterministic validation errors.
- No runtime behavior changes when feature flag is disabled.

## Phase 2: Read-Only Community Entry Points

### Phase 2 Scope

- Add module-level "Community" CTA links to provider destinations.
- Add server-generated safe outbound links from module pages.
- Emit observability events for community click-through rates.

### Phase 2 Exit Criteria

- Users can navigate to relevant community areas from each module.
- Click-through metrics available by module and locale.
- Integration can be disabled instantly with feature flag.

## Phase 3: SSO and Identity Federation

### Phase 3 Scope

- Implement provider SSO handoff using server-side signing secret.
- Map app user identity to stable Discourse external IDs.
- Add role mapping policy (admin/mod/member) with least privilege defaults.

### Phase 3 Exit Criteria

- Authenticated users land in Discourse without separate login.
- Account linking is deterministic and idempotent.
- Security review completed for secret handling and replay protection.

## Phase 4: Event Sync and Lightweight Cohorts

### Phase 4 Scope

- Sync selected app events to Discourse automation hooks (opt-in only).
- Support cohort threads for weekly practices and facilitator prompts.
- Add moderation metadata and abuse controls to sync payloads.

### Phase 4 Exit Criteria

- Opt-in event sync works with retry and dead-letter logging.
- Cohort participation metrics are visible in admin telemetry.
- Moderation incidents remain below agreed threshold.

## Phase 5: Embedded Signals and Analytics Loop

### Phase 5 Scope

- Show contextual "active discussions" snippets inside module dashboards.
- Feed community participation signals into motivation analytics features.
- Add KPI dashboard for retention, module completion uplift, and safety incidents.

### Phase 5 Exit Criteria

- Embedded insights improve module return rates.
- Analytics clearly separates causation assumptions from correlation.
- Product review approves continuation or rollback path.

## Phase 6: Hardening, Governance, and Operations

### Phase 6 Scope

- Add runbooks for Discourse outage, sync backlog, and moderation surge.
- Add SLOs for sync freshness and SSO success rates.
- Define annual governance review for privacy, moderation, and policy fit.

### Phase 6 Exit Criteria

- Pager and ownership model documented.
- Recovery drills completed for top 3 failure scenarios.
- Compliance sign-off recorded for data-sharing boundaries.

## KPI Set Across Phases

- Community CTR from module pages
- Weekly active community participants
- 30-day module return rate delta (participant vs non-participant)
- Practice completion uplift for cohort participants
- Moderation incidents per 1,000 community interactions
- Community SSO success rate

## Plug-and-Play Provider Contract

- Add a new provider value in `CommunityProvider`.
- Extend `getCommunityConfig` to parse provider-specific env settings.
- Add provider URL building logic and tests for each module key.
- Reuse `/api/community/link` so the UI remains unchanged.
- Keep kill switch behavior consistent via `COMMUNITY_INTEGRATION_PROVIDER=none`.

## Rollback Strategy

- Global kill switch: `DISCOURSE_INTEGRATION_ENABLED=false`
- Keep all core module APIs independent from Discourse.
- Fail-open UI: hide community integrations when config invalid or downstream unavailable.

## Current Status

- Phase 1 implemented in code and tests.
- Phase 2 implemented in code and tests.
- Phase 3 partially implemented: DiscourseConnect SSO callback endpoint and signature validation are in place; production rollout requires Discourse admin configuration.
- Phases 4-6 pending incremental delivery.
