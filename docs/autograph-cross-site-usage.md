# Using Autograph Exchange From Different Websites

## What is reusable now

The reusable UI lives in:
- `@autograph-exchange/feature`

Main exports:
- `AutographExchangeFeature`
- `AutographExchangeScreen`
- `useAutographExchange`
- `useAutographExchangeViewModel`
- `SignaturePreview`
- `buildSignaturePreset`
- feature types from `@autograph-exchange/feature`
- starter stylesheet: `@autograph-exchange/feature/styles.css`

This package is now UI plus client orchestration.
For most websites, `AutographExchangeFeature` is the easiest entry point.
Your website supplies:
- auth state
- current user
- optional API endpoint overrides
- optional custom copy
- optional custom signature preview
- optional shell wrapper

## How a host app uses it

One host-wrapper example is here:
- [apps/frontend/app/autograph-exchange/page.tsx](/Users/rraviku2/kailasa/buddhi-align-app/apps/frontend/app/autograph-exchange/page.tsx:1)

That file is the best reference implementation:
- app auth: `next-auth`
- app layout: `ModuleLayout`
- package data hook: `useAutographExchange`
- package view-model: `useAutographExchangeViewModel`

## Minimal integration steps for another website

1. Add the package dependency.
2. Import `@autograph-exchange/feature/styles.css` in your app shell or page layout.
3. Build a wrapper page that:
   - gets the signed-in user
   - passes `authStatus` and `viewer` into `AutographExchangeFeature`
   - optionally supplies a shell wrapper and copy overrides

## Example: Next.js website with its own auth

```tsx
"use client";

import {
  AutographExchangeFeature,
} from "@autograph-exchange/feature";
import "@autograph-exchange/feature/styles.css";
import { useMyAuth } from "@/lib/auth";

export default function AutographPage() {
  const { user, status } = useMyAuth();

  return (
    <AutographExchangeFeature
      authStatus={status}
      viewer={user ? { id: user.id, name: user.name, email: user.email } : null}
      signInHref="/sign-in"
      renderShell={(content) => <main className="page-shell">{content}</main>}
    />
  );
}
```

## Example: React SPA on another domain

Use your own backend instead of a host app's `/api/autographs/*`.

```tsx
import { useEffect, useState } from "react";
import { AutographExchangeScreen } from "@autograph-exchange/feature";
import "@autograph-exchange/feature/styles.css";

function usePortalAutographs(userId?: string) {
  // Call your own APIs:
  // GET /portal-api/autographs/profiles
  // GET /portal-api/autographs/requests
  // PUT /portal-api/autographs/profiles
  // POST /portal-api/autographs/requests
  // POST /portal-api/autographs/requests/:id/sign
}
```

The key point is:
- the feature package does not require Next.js routing
- it does not require `next-auth`
- it does not require any specific host app shell
- it owns the client hook, view-model, and default signed-out/loading states already

For the backend side, use the shared contract here:
- [autograph-api-contract.md](/Users/rraviku2/kailasa/buddhi-align-app/docs/autograph-api-contract.md:1)

## Example: multi-site rollout

If you want the same feature on multiple websites:

1. Standardize one autograph backend contract.
2. Reuse `AutographExchangeScreen` in each site-specific wrapper.
3. Keep per-site differences in:
   - auth adapter
   - layout wrapper
   - copy overrides
   - signature preview branding

## Recommended adapter shape

Create one wrapper per website with these responsibilities:

```ts
type WebsiteAutographAdapter = {
  useAuth(): {
    status: "loading" | "authenticated" | "unauthenticated";
    user: { id: string; name?: string; email?: string } | null;
  };
  useAutographData(userId?: string): AutographScreenState;
  renderShell(children: React.ReactNode): React.ReactNode;
};
```

That keeps the reusable feature package stable while each website plugs in its own infrastructure.

## Current limits

What remains site-specific:
- storage implementation
- API endpoints
- auth/session implementation
- optional i18n wiring
- optional page shell/layout branding

## Best references

- reusable package UI: [packages/autograph-feature/AutographExchangeScreen.tsx](/Users/rraviku2/kailasa/autograph-exchange/packages/autograph-feature/AutographExchangeScreen.tsx:1)
- one-component entry point: [packages/autograph-feature/AutographExchangeFeature.tsx](/Users/rraviku2/kailasa/autograph-exchange/packages/autograph-feature/AutographExchangeFeature.tsx:1)
- ready-made Next.js adapter hook: [packages/autograph-feature/examples/nextjs/useAutographFeatureAdapter.example.ts](/Users/rraviku2/kailasa/autograph-exchange/packages/autograph-feature/examples/nextjs/useAutographFeatureAdapter.example.ts:1)
- ready-made Next.js wrapper page: [packages/autograph-feature/examples/nextjs/NextAutographFeaturePage.example.tsx](/Users/rraviku2/kailasa/autograph-exchange/packages/autograph-feature/examples/nextjs/NextAutographFeaturePage.example.tsx:1)
- example host wrapper: [apps/frontend/app/autograph-exchange/page.tsx](/Users/rraviku2/kailasa/buddhi-align-app/apps/frontend/app/autograph-exchange/page.tsx:1)
