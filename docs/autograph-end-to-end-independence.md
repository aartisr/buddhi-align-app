# Autograph End-to-End Independence

## Current architecture

Autograph Exchange is now split into three reusable layers, and each layer is consumable outside this app:

1. UI package
   - [packages/autograph-feature](/Users/rraviku2/kailasa/autograph-exchange/packages/autograph-feature)
2. API contract package
   - [packages/autograph-contract](/Users/rraviku2/kailasa/autograph-exchange/packages/autograph-contract)
3. Backend/core logic package
   - [packages/autograph-core](/Users/rraviku2/kailasa/autograph-exchange/packages/autograph-core)

The app-specific code in `apps/frontend` is now adapter code only:
- app auth/session
- app layout
- app data-provider wiring
- app feature toggle
- app route registration

## What this means

The feature is now independent end to end in architecture:
- frontend rendering and client state are reusable
- API types and paths are reusable
- backend business logic and Next.js route handlers are reusable

What remains website-specific is only infrastructure:
- auth implementation
- storage provider
- page shell/layout
- optional feature-toggle wiring

## Reusing on another website

### Frontend
Use:
- `@autograph-exchange/feature`

That package now contains:
- `AutographExchangeScreen`
- `useAutographExchange`
- `useAutographExchangeViewModel`
- `SignaturePreview`
- `buildSignaturePreset`
- `styles.css`

### Backend contract
Use:
- `@autograph-exchange/contract`

### Backend logic
Use:
- `@autograph-exchange/core`

Implement your own storage adapter matching the `AutographStorage` interface and pass it to:
- `createAutographService(...)`

If you are on Next.js, you can also reuse the route factories from `@autograph-exchange/core`:
- `createAutographProfilesGetHandler`
- `createAutographProfilesPutHandler`
- `createAutographRequestsGetHandler`
- `createAutographRequestsPostHandler`
- `createAutographSignPostHandler`

Reference:
- [packages/autograph-core/service.ts](/Users/rraviku2/kailasa/autograph-exchange/packages/autograph-core/service.ts:1)
- [packages/autograph-core/next.ts](/Users/rraviku2/kailasa/autograph-exchange/packages/autograph-core/next.ts:1)

## Host Adapter Example

Example host wrapper:
- backend adapter: [apps/frontend/app/lib/autographs/service.ts](/Users/rraviku2/kailasa/buddhi-align-app/apps/frontend/app/lib/autographs/service.ts:1)
- frontend adapter: [apps/frontend/app/autograph-exchange/page.tsx](/Users/rraviku2/kailasa/buddhi-align-app/apps/frontend/app/autograph-exchange/page.tsx:1)
- route registration:
  - [profiles route](/Users/rraviku2/kailasa/buddhi-align-app/apps/frontend/app/api/autographs/profiles/route.ts:1)
  - [requests route](/Users/rraviku2/kailasa/buddhi-align-app/apps/frontend/app/api/autographs/requests/route.ts:1)
  - [sign route](/Users/rraviku2/kailasa/buddhi-align-app/apps/frontend/app/api/autographs/requests/[id]/sign/route.ts:1)
- standalone website project:
  [autograph-exchange](/Users/rraviku2/kailasa/autograph-exchange)

Those files now show the intended adapter pattern:
- the packages own the feature logic
- the app only provides auth, layout, storage, and toggling
