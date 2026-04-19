# World-Class Generic Data Model Recommendations

This document defines a production-grade generic database architecture for Buddhi Align while preserving compatibility with existing module APIs.

## Goals

- Keep the existing generic write shape (`module` + `data`) working without API rewrites.
- Add explicit multi-tenant support with strong isolation boundaries.
- Support high-volume reads and analytics without degrading write latency.
- Add durable event history for replay, audit, and debugging.
- Support optional Supabase JWT-based RLS without forcing client-side database access.

## Core Design

### 1. Canonical object table: `module_entries`

`module_entries` remains the canonical current-state table. New columns strengthen integrity and enable consistent cross-feature behavior.

- `tenant_id`: tenant partition key (default `default`)
- `object_type`: semantic type (`module_entry` default)
- `module`: logical module name (still unrestricted at DB level for extensibility)
- `owner_subject`: principal subject/user id
- `scope`: `private` | `shared` | `public`
- `status`: `active` | `archived` | `deleted`
- `version`: optimistic concurrency version
- `dedupe_key`: idempotent write key
- `source`: producer metadata
- `tags`: lightweight categorization
- `data`: JSONB payload (module-specific schema remains in app layer)
- `event_at`, `created_at`, `updated_at`, `deleted_at`

### 2. Event log: `module_entry_events`

Append-only table for immutable changes and operational audit.

- References `module_entries.id`
- Stores `event_type`, `actor_subject`, `event_payload`
- Includes optional `idempotency_key`
- Indexed for per-entry and per-tenant replay

### 3. Read model: `module_entry_projections`

Denormalized read table optimized for query-heavy experiences.

- One row per entry (`entry_id` PK)
- Stores tenant/module/owner/current status and JSON projection
- Tracks `last_event_id` and `last_event_occurred`
- Provides GIN index for JSON projection filters

### 4. Lifecycle and consistency helpers

- Update trigger on `module_entries`:
  - auto-touch `updated_at`
  - enforce monotonic `version`
  - normalize status to `deleted` when `deleted_at` is set
- Update trigger on `module_entry_projections`:
  - auto-touch `updated_at`

## Indexing Strategy

Primary indexes were selected for expected hot paths:

- `module_entries(tenant_id, module, created_at desc)` where active
- `module_entries(tenant_id, owner_subject, created_at desc)` where active
- `module_entries(tenant_id, status)` where active
- GIN on `module_entries.data`
- Unique partial dedupe index: `(tenant_id, module, dedupe_key)` where dedupe_key is not null
- Event table replay and payload GIN indexes
- Projection table tenant/module and tenant/owner indexes + projection GIN

## Isolation and Security

### Default runtime mode

- App API uses service-role key server-side.
- RLS is enabled by default.
- Anon/authenticated direct table access is denied by default via explicit deny policies.
- Server-side service-role traffic continues to function for API routes.

### Optional strict mode (if querying via anon/authenticated keys)

- Helper functions:
  - `buddhi_current_tenant()` from JWT claim `tenant_id`
  - `buddhi_current_subject()` from JWT claim `sub`
- Example RLS policies are included in `supabase/schema.sql` as a blueprint.

## Backward Compatibility

Compatibility is preserved by design:

- Existing `module_entries` queries still work.
- Existing writes that only send `module` + `data` still work.
- Upgrade path uses `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`.
- Existing API/provider logic can migrate to tenant-aware filters incrementally.

## Operational Guidance

- Keep domain-level validation in application code (module contracts and DTO guards).
- Use `dedupe_key` for retry-safe writes.
- Use `module_entry_events` for compliance timelines and replay.
- Use `module_entry_projections` for read-heavy screens, analytics rollups, and exports.
- Add domain-specific projections as separate tables only when justified by query cost.

## Testability Requirements

The schema should be protected with CI assertions for:

- critical tables and columns
- constraint presence and safety checks
- index coverage for hot query paths
- event/projection table existence
- trigger and helper-function definitions
- optional RLS policy blueprint presence

These checks are implemented in the Vitest suite.
