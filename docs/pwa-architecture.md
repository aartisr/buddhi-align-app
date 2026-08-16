# Buddhi Align PWA architecture

The PWA is intentionally dependency-free and modular. It uses browser standards so it can be moved to another Next.js application without bringing a framework-specific service-worker package along.

## Components

- `apps/frontend/app/manifest.ts` is the type-safe, canonical install contract served at `/manifest.webmanifest`: identity, icons, display mode, and app shortcuts.
- `apps/frontend/public/sw.js` is the offline contract. It caches only the public application shell and static assets.
- `apps/frontend/public/offline.html` is the connection-loss fallback and has no runtime dependency.
- `apps/frontend/app/components/pwa/PwaProvider.tsx` owns registration, install prompting, connection status, and user-controlled updates.
- `apps/frontend/app/components/pwa/pwa-contract.test.ts` protects the public PWA behavior from accidental regression.

## Cache policy

| Request | Strategy | Reason |
| --- | --- | --- |
| Public navigation | Network first, then runtime cache, then offline page | Current content wins when connected; previously visited pages remain useful offline. |
| Scripts, styles, fonts, images, audio, video | Stale while revalidate | Fast repeat visits without making releases wait for an old cache. |
| API, auth, admin, and settings routes | Network only | Personal data and authenticated state are never served from the service-worker cache. |

## Reuse checklist

1. Change the app name, colors, icons, and shortcuts in `app/manifest.ts`.
2. Change `CACHE_PREFIX` in `sw.js` to avoid a cache collision with another app on the same origin.
3. Keep sensitive or user-specific paths in `isApiOrPrivateRoute`.
4. Mount `PwaProvider` once near the application root.
5. Keep the `sw.js` response revalidating (`max-age=0, must-revalidate`) so deployments receive updates promptly.

The update UI never forces an immediate reload. A person explicitly chooses **Update now**, which sends `SKIP_WAITING` to the waiting worker and reloads only after it becomes active.
