# Component and Page Engineering Standards

This standard applies to all files under `app/**` and is enforced by lint + tests.

## Modularity

- Keep complex view-model logic in pure helper modules under `app/lib/**`.
- Components and pages should compose helpers instead of implementing business rules inline.
- Prefer typed interfaces for operations and derived state contracts.

## Maintainability

- Keep render logic focused on UI composition.
- Use small helper functions for derivations (navigation, filtering, classification, etc.).
- Add tests for extracted helpers before wiring them into page components.

## Performance

- Avoid rebuilding stable maps/arrays inside render paths.
- Use memoization (`useMemo`, `useCallback`) for expensive or frequently reused computed values.
- Keep non-UI side effects out of render paths.

## Robustness and Resilience

- Treat observability and admin automation as non-blocking side effects.
- Fail safely in helper operations; never break main user flows due to telemetry/automation failures.
- Prefer defensive parsing and explicit fallbacks.

## Enforced Guardrails

`apps/frontend/.eslintrc.json` includes repo-wide constraints for `app/**/*.{ts,tsx}`:

- complexity
- nesting depth
- function length
- implicit coercion
- no-console policy
- no-else-return

These rules are intended to keep all components/pages generic, modular, maintainable, and production-ready.
