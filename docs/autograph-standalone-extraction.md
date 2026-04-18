# Autograph Exchange Standalone Extraction

## What was extracted

The autograph feature now has a standalone website project:

- [autograph-exchange](/Users/rraviku2/kailasa/autograph-exchange)

That workspace uses the same core stack as the original host app:

- Next.js App Router
- React
- TypeScript
- NextAuth
- shared workspace packages

## Reuse boundary

The extraction keeps reuse centered in the standalone project's shared packages:

- UI and host-ready feature entry:
  [packages/autograph-feature](/Users/rraviku2/kailasa/autograph-exchange/packages/autograph-feature)
- API contract:
  [packages/autograph-contract](/Users/rraviku2/kailasa/autograph-exchange/packages/autograph-contract)
- business logic and reusable route factories:
  [packages/autograph-core](/Users/rraviku2/kailasa/autograph-exchange/packages/autograph-core)

This is the core software-engineering boundary:

- shared packages own feature behavior
- each website owns only host concerns

## Host responsibilities

Original host-app responsibilities:
- app auth/session
- app shell/layout
- host storage adapter
- host feature toggle

Standalone `autograph-exchange` host responsibilities:
- lightweight local credentials sign-in
- standalone page shell
- file-backed storage adapter

## Why this is safer than copying routes

This avoids duplicated feature logic across websites:

- no duplicate screen composition
- no duplicate request/profile business rules
- no duplicate API contract definitions
- no duplicate signature preview logic

Each website can evolve branding and auth independently while still consuming the same feature core.

## Running each site

Original host app:

```bash
npm run dev:frontend
```

Standalone autograph site:

```bash
npm run dev:autograph-exchange
```

## Future split into a separate git repository

The physical split has now been done into:

1. `autograph-exchange/apps/autograph-exchange`
2. `autograph-exchange/packages/autograph-feature`
3. `autograph-exchange/packages/autograph-contract`
4. `autograph-exchange/packages/autograph-core`

The original host app now consumes those packages through external file dependencies and path aliases instead of local workspace ownership.

For easier day-to-day development, the separate repo is also exposed inside this workspace at:

- [external/autograph-exchange](/Users/rraviku2/kailasa/buddhi-align-app/external/autograph-exchange)
