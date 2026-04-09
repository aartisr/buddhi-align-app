# OIDC Hardening Checklist

This checklist defines the OpenID Connect hardening baseline for the frontend app.

## Goals

- Verify identity with standard OIDC claims and cryptographic checks.
- Keep provider behavior predictable across Google, Microsoft Entra ID, and Apple.
- Reduce account-linking and session-integrity risk in multi-provider auth.

## Implemented Baseline

- OIDC providers request explicit OIDC scopes (`openid profile email`).
- PKCE, state, and nonce checks are enabled for OIDC providers where supported.
- Microsoft Entra ID requests `offline_access` for refresh-token compatibility.
- A provider-scoped `identityKey` is added to JWT/session for safer analytics joins and audits.
- `authConfidence` is added to JWT/session (`oidc`, `oauth`, `unknown`) for policy decisions.
- `authAt` is added to JWT/session and enforced as a step-up freshness window for sensitive actions.
- Sensitive routes now enforce OIDC confidence:
  - `/admin`
  - `/admin-access`
  - `/api/admin/*`
  - `/api/data/export`
- Sensitive routes now enforce recent step-up authentication (default 15 minutes, configurable via `AUTH_STEP_UP_MAX_AGE_MS`).

## Provider Matrix

### Google

- Type: OIDC
- Scope: `openid profile email`
- Checks: `pkce`, `state`, `nonce`
- Notes: `prompt=select_account` reduces accidental wrong-account sign-ins.

### Microsoft Entra ID

- Type: OIDC
- Scope: `openid profile email offline_access`
- Checks: `pkce`, `state`, `nonce`
- Notes: keep issuer tenant-specific in production when possible.

### Apple

- Type: OIDC-like
- Scope: provider default, with identity from ID token
- Checks: `state`, `nonce`
- Notes: email/name may only be returned on first consent.

### GitHub

- Type: OAuth 2.0 (not strict OIDC)
- Scope: `read:user user:email`
- Checks: provider defaults
- Notes: treat identity confidence as OAuth-only.

### Facebook

- Type: OAuth 2.0
- Scope: `email public_profile`
- Checks: provider defaults
- Notes: treat identity confidence as OAuth-only.

## Operational Hardening (Next)

- Restrict production sign-in options to OIDC-capable providers for sensitive user flows.
- Normalize identity claims in one utility module:
  - canonical subject source (`iss + sub` for OIDC)
  - normalized email and verification status
  - auth confidence level (`oidc`, `oauth`)
- Record provider, identity key, and auth confidence in audit logs for exports/admin actions.
- Add rate limiting and bot checks on sign-in endpoints.
- Add provider-specific failure dashboards (callback errors, token refresh failures).

## Testing Checklist

- Sign-in and callback for each enabled provider.
- Verify callback URL sanitization blocks open redirects.
- Verify middleware protects all non-public routes.
- Verify anonymous mode never reads/writes authenticated user data.
- Verify session includes `provider` and `identityKey` after login.

## Production Controls

- Set `AUTH_SECRET` to a strong secret.
- Do not set localhost auth URLs in production.
- Prefer tenant-specific Entra issuer over `common` for enterprise deployments.
- Keep provider client secrets rotated and monitored.
