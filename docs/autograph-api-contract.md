# Autograph API Contract

## Goal
Provide one reusable backend contract for Autograph Exchange so multiple websites can implement the same feature without inventing new payloads or routes each time.

## Shared package

Use:
- `@autograph-exchange/contract`

Main exports:
- `AUTOGRAPH_API`
- `AUTOGRAPH_PROFILES_MODULE`
- `AUTOGRAPH_REQUESTS_MODULE`
- `AutographProfile`
- `AutographRequest`
- `UpsertAutographProfileInput`
- `CreateAutographRequestInput`
- `SignAutographRequestInput`
- `AutographErrorResponse`

Reference:
- [packages/autograph-contract/index.ts](/Users/rraviku2/kailasa/autograph-exchange/packages/autograph-contract/index.ts:1)

## Canonical routes

```ts
AUTOGRAPH_API.profiles
// /api/autographs/profiles

AUTOGRAPH_API.requests
// /api/autographs/requests

AUTOGRAPH_API.signRequest(id)
// /api/autographs/requests/:id/sign
```

## Route contract

### `GET /api/autographs/profiles`

Response:
```ts
AutographProfile[]
```

### `PUT /api/autographs/profiles`

Request body:
```ts
UpsertAutographProfileInput
```

Response:
```ts
AutographProfile
```

### `GET /api/autographs/requests`

Response:
```ts
AutographRequest[]
```

### `POST /api/autographs/requests`

Request body:
```ts
CreateAutographRequestInput
```

Response:
```ts
AutographRequest
```

### `POST /api/autographs/requests/:id/sign`

Request body:
```ts
SignAutographRequestInput
```

Response:
```ts
AutographRequest
```

## Error contract

For non-success responses:

```ts
type AutographErrorResponse = {
  error: string;
}
```

Recommended statuses:
- `401` when auth is required
- `404` when the feature is disabled or the route is unavailable
- `400` for user-fixable validation errors
- `500` for unexpected server failures

## Example: implementing on another website

```ts
import {
  AUTOGRAPH_API,
  type AutographProfile,
  type AutographRequest,
  type CreateAutographRequestInput,
  type SignAutographRequestInput,
  type UpsertAutographProfileInput,
} from "@autograph-exchange/contract";
```

Then expose routes on your own site that match those paths and shapes.

If you are using Next.js, you can pair this package with the route factories in:
- `@autograph-exchange/core`

Reference:
- [packages/autograph-core/next.ts](/Users/rraviku2/kailasa/autograph-exchange/packages/autograph-core/next.ts:1)

## Example: external client

```ts
import { AUTOGRAPH_API, type AutographProfile } from "@autograph-exchange/contract";

async function listProfiles(): Promise<AutographProfile[]> {
  const res = await fetch(AUTOGRAPH_API.profiles, {
    credentials: "include",
  });

  if (!res.ok) {
    const payload = await res.json();
    throw new Error(payload.error ?? "Unable to load profiles");
  }

  return res.json();
}
```

## Host Integration References

- frontend hook using the contract: [packages/autograph-feature/useAutographExchange.ts](/Users/rraviku2/kailasa/autograph-exchange/packages/autograph-feature/useAutographExchange.ts:1)
- backend/core logic package: [packages/autograph-core/service.ts](/Users/rraviku2/kailasa/autograph-exchange/packages/autograph-core/service.ts:1)
- reusable Next route factories: [packages/autograph-core/next.ts](/Users/rraviku2/kailasa/autograph-exchange/packages/autograph-core/next.ts:1)
- example host server routes:
  - [profiles route](/Users/rraviku2/kailasa/buddhi-align-app/apps/frontend/app/api/autographs/profiles/route.ts:1)
  - [requests route](/Users/rraviku2/kailasa/buddhi-align-app/apps/frontend/app/api/autographs/requests/route.ts:1)
  - [sign route](/Users/rraviku2/kailasa/buddhi-align-app/apps/frontend/app/api/autographs/requests/[id]/sign/route.ts:1)

## Portability outcome

With this package plus the reusable UI package:
- `@autograph-exchange/feature` gives you the screen
- `@autograph-exchange/contract` gives you the backend shape
- `@autograph-exchange/core` gives you the business rules

That means another website can now reuse both:
- the frontend component contract
- the backend API contract
- the backend/core service logic
