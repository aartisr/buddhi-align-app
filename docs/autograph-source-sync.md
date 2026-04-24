# Autograph Exchange Source Sync

This document explains how buddhi-align-app pulls the latest source from autograph-exchange and wires it into the frontend.

## Overview

buddhi-align-app does not consume autograph packages from a remote npm registry by default.
Instead, it fetches source code into a local folder and installs from local file paths.

Flow:

1. Fetch autograph-exchange source into `external/autograph-exchange`.
2. Install frontend dependencies that point to that local source tree.
3. Build and run using those local package links.

## Fetch Mechanism

The fetch is implemented in:

- `scripts/prepare-autograph-source.mjs`

Key behavior:

- Default repo URL: `https://github.com/aartisr/autograph-exchange.git`
- Default ref/branch: `main`
- Clone strategy: shallow clone (`git clone --depth=1 --branch <ref>`)
- Target path: `external/autograph-exchange`
- Fallback: if clone of the default public repo fails, download GitHub tarball and extract
- Validation: verifies required package paths exist:
  - `packages/autograph-contract/package.json`
  - `packages/autograph-core/package.json`
  - `packages/autograph-feature/package.json`

Supported overrides:

- `AUTOGRAPH_EXCHANGE_REPO_URL`
- `AUTOGRAPH_EXCHANGE_REPO_REF`
- `AUTOGRAPH_EXCHANGE_SKIP_CLONE=1` (skip fetching)

## Install Wiring

Root scripts in `package.json`:

- `prepare:autograph-source`: runs the fetch script
- `install:with-autograph-source`: runs source prep, then workspace install

Frontend package links in `apps/frontend/package.json`:

- `@aartisr/autograph-contract`: `file:../../external/autograph-exchange/packages/autograph-contract`
- `@aartisr/autograph-core`: `file:../../external/autograph-exchange/packages/autograph-core`
- `@aartisr/autograph-feature`: `file:../../external/autograph-exchange/packages/autograph-feature`

Because these are `file:` dependencies, the app uses the fetched local source revision.

## Deployment Behavior

Vercel is configured to use the sync-aware install command:

- `vercel.json` sets `installCommand` to `node scripts/vercel-install.mjs`

That script prepares the autograph-exchange source, strips stale npm auth
configuration, forces the public npm registry, and then runs the workspace
install. This ensures Vercel pulls the selected autograph-exchange ref during
install without depending on private package state.

## What "Latest" Means

"Latest" is determined by the selected ref at fetch time:

- Default behavior pulls latest commit on `main`
- If `AUTOGRAPH_EXCHANGE_REPO_REF` is set, latest commit on that ref is used

A plain `npm install` does not guarantee a refresh from GitHub unless `install:with-autograph-source` (or `prepare:autograph-source`) is run.

## Recommended Commands

From repo root:

```bash
npm run install:with-autograph-source
npm run build
```

Using a custom repo/ref:

```bash
AUTOGRAPH_EXCHANGE_REPO_URL=https://github.com/<owner>/autograph-exchange.git \
AUTOGRAPH_EXCHANGE_REPO_REF=main \
npm run install:with-autograph-source
```
