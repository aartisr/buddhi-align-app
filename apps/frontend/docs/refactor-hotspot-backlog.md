# Refactor Hotspot Backlog

This backlog tracks temporary legacy carve-outs from strict lint guardrails.

## Purpose

The app now enforces strict `error` level maintainability rules across `app/**/*.{ts,tsx}`.
The files below are temporary exceptions while we decompose large flows into smaller modules.

## Current Hotspots

- None. All temporary carve-outs are now removed.

## Completed In This Cycle

- `app/components/ModuleLayout.tsx`
- `app/components/PreferencesMenu.tsx`
- `app/api/data/export/route.ts`
- `app/components/RequestFeedbackProvider.tsx`
- `app/motivation-analytics/page.tsx`
- `app/admin/page.tsx`

## Required Completion Criteria Per File

- `max-lines-per-function` warning eliminated
- `complexity` warning eliminated
- no change in observable behavior
- targeted tests added/updated for extracted modules

## Refactor Strategy

1. Extract pure derivation/view-model helpers into `app/lib/**`.
2. Split large component render branches into focused child components.
3. Isolate server route authorization/validation logic into reusable guards.
4. Keep observability side effects non-blocking.
5. Remove file from lint exception list once criteria are met.

## Rule Ownership

- Engineering owner: Frontend maintainability
- Review cadence: remove at least one hotspot per release cycle
