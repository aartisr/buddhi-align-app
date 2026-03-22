# Buddhi Align Frontend

[![Shishu Bharati Logo](https://www.shishubharati.net/wp-content/uploads/2024/07/ShishuBharati-Logo-Transparent-HiRes-150x150.png)](https://www.shishubharati.net/)

This frontend is dedicated by **Aarti S Ravikumar** to **Shishubharati**.

The author is grateful to the teachers and volunteers of Shishu Bharati.

Website: [https://www.shishubharati.net/](https://www.shishubharati.net/)

## Overview
This app is the Next.js frontend for Buddhi Align. It delivers a module-driven user interface for Buddhi Yoga inspired practices, including karma, bhakti, jnana, dhyana, vasana, and dharma pathways.

## Stack
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Vitest + Testing Library

## Development
Run from `apps/frontend`:

```bash
npm run dev
```

App URL: [http://localhost:3000](http://localhost:3000)

## Build and Quality
```bash
npm run lint
npm run test
npm run build
```

## Test Layout
- `app/**/*.test.tsx`: frontend component and route-level tests.
- `vitest.config.ts`: Vitest configuration.
- `vitest.setup.ts`: DOM matcher setup.

## Key Conventions
- Keep route files focused and lightweight.
- Place reusable visuals in `app/components`.
- Use shared package imports (`@buddhi-align/shared-ui`) for cross-module consistency.
- Add tests for feature wiring and user-visible behavior.

## Links
- Root documentation: `README.md`
- Next.js docs: [https://nextjs.org/docs](https://nextjs.org/docs)
