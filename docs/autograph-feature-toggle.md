# Autograph Feature Toggle

## Goal
Keep Autograph Exchange portable and easy to enable or disable without hand-editing multiple app surfaces.

## Single source of truth
- Feature metadata and enablement live in [apps/frontend/app/lib/autographs/feature.ts](/Users/rraviku2/kailasa/buddhi-align-app/apps/frontend/app/lib/autographs/feature.ts:1)
- Default app-level setting lives in [packages/site-config/siteConfig.ts](/Users/rraviku2/kailasa/buddhi-align-app/packages/site-config/siteConfig.ts:1)

## How to turn it off
Use either of these:

1. Set `NEXT_PUBLIC_ENABLE_AUTOGRAPH_EXCHANGE=false`
2. Or set `siteConfig.features.autographExchange` to `false`

Environment variable wins if both are present.

## What is automatically gated
- Module catalog and navigation
- Invite module options
- Sitemap entry
- Community module slug mapping
- All `/autograph-exchange` routes through feature layout
- All `/api/autographs/*` endpoints

## Porting checklist
1. Copy the `autograph-exchange` route folder.
2. Copy `app/lib/autographs/*`.
3. Copy `app/api/autographs/*`.
4. Copy the feature metadata file and wire it into your module catalog if needed.
5. Set the toggle in config or environment.

## Design intent
The feature now has:
- One enable/disable switch
- One route root
- One API root
- One community slug

That keeps it much closer to a self-contained module than a scattered app customization.
