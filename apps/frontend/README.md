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

## Background Music Source
The background music player supports a configurable source URL.

- Environment variable: `NEXT_PUBLIC_BGM_URL`
- Optional playlist variable: `NEXT_PUBLIC_BGM_URLS` (comma-separated HTTPS URLs)
- Fallback: Pixabay royalty-free track (if the variable is missing or invalid)

Example:

```bash
NEXT_PUBLIC_BGM_URL=https://cdn.pixabay.com/audio/2022/10/16/audio_12b5fae3b6.mp3
```

Playlist example:

```bash
NEXT_PUBLIC_BGM_URLS=https://cdn.pixabay.com/audio/2022/10/16/audio_12b5fae3b6.mp3,https://example.com/track2.mp3,https://example.com/track3.mp3
```

If `NEXT_PUBLIC_BGM_URLS` is set with valid URLs, tracks auto-rotate when each track ends.

Tip: prefer HTTPS direct audio URLs (`.mp3`, `.ogg`, `.wav`) from providers whose license allows your use case.

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
