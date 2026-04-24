# Search, AI, and Social Growth Audit

Last updated: 2026-04-23

## Positioning

Buddhi Align should be presented as a contemplative-practice web app, not just a journal. The strongest memorable line is:

> Plan one intention. Record one practice. Reflect once. Watch consistency become visible.

This gives people and answer engines a simple mental model: plan, practice, reflect, review.

## Implemented Improvements

- Centralized public route profiles in `apps/frontend/app/lib/public-content.ts`.
- Enriched metadata in `apps/frontend/app/lib/seo.ts` with route-specific keywords, canonical URLs, social previews, robots directives, JSON-LD, WebApplication, WebPage, BreadcrumbList, FAQPage, and ItemList data.
- Added `/share` as a public share kit with invite links, captions, and canonical route summaries.
- Added visible homepage FAQ and public summary sections so structured data is backed by on-page content.
- Refreshed `llms.txt` and `llms-full.txt` so AI answer engines have concise, canonical product guidance.
- Added `/share` to sitemap generation through the shared route catalog.
- Upgraded Open Graph and Twitter image routes to a more distinctive, share-ready visual narrative.
- Added package metadata keywords and app manifest shortcuts for share and analytics flows.
- Split the homepage into a server wrapper and client interaction component so JSON-LD is emitted server-side while interactive dashboard behavior stays isolated.
- Added route-contract tests that keep public page profiles, sitemap output, share destinations, and crawler exclusions aligned.

## Why These Matter

Google's SEO guidance emphasizes helping search engines understand content and helping users decide whether to visit. It also notes that there is no automatic ranking secret, so the practical goal is crawlability, clarity, and useful content.

Structured data helps Google understand page content and can make eligible pages more visible in rich result contexts when the markup is accurate and valid.

Open Graph metadata gives social platforms the title, canonical URL, image, and description needed to create rich previews when users share links.

Schema.org's WebApplication and SoftwareApplication vocabulary supports application metadata such as category, operating system, feature list, audience, offers, and screenshots.

## Remaining Growth Work

- Submit `https://buddhi-align.foreverlotus.com/sitemap.xml` in Google Search Console after deployment.
- Validate deployed pages with Google's Rich Results Test and URL Inspection.
- Run PageSpeed Insights on the homepage, `/share`, and each module route.
- Add real user-facing screenshots to the web manifest once final production screenshots are approved.
- Instrument share events by channel, destination module, and invite conversion.
- Test three share captions for seven days each and keep the highest invite-to-first-entry conversion.
- Publish one high-quality external page or article that links to the homepage and one specific module.
- Install Lighthouse locally or run the CI performance job in an environment with npm registry access so the existing performance budget can execute strictly.

## References

- Google SEO Starter Guide: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Google structured data intro: https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
- Google AI features and website controls: https://developers.google.com/search/docs/appearance/ai-features
- Open Graph protocol: https://ogp.me/
- Schema.org WebApplication: https://schema.org/WebApplication
