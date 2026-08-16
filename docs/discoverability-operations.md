# Discoverability operations

The application automatically publishes canonical metadata, JSON-LD, `robots.txt`, `sitemap.xml`, RSS, `llms.txt`, and a PWA manifest. The scheduled **Live discoverability validation** workflow checks the deployed production endpoints daily and can be started manually after a deployment.

## Owner-required submissions

Search-engine submission requires the verified owner account and cannot be performed safely from repository automation.

1. Submit `https://buddhi-align.foreverlotus.com/sitemap.xml` in Google Search Console.
2. Submit the same sitemap in Bing Webmaster Tools. Bing can distribute discovery to partner search experiences.
3. Keep the deployed `robots.txt`, sitemap, and canonical host reachable without authentication.
4. Use Google’s Rich Results Test after material schema changes; the scheduled workflow verifies that the source JSON-LD and author entity remain available.

## Release checks

- CI blocks on configured Vitest coverage thresholds and high/critical production dependency vulnerabilities.
- CI runs the mobile-emulated PWA smoke test, covering manifest installability signals, service-worker control, and offline fallback.
- The scheduled production workflow validates the live canonical, crawler, AI, and PWA endpoints.
- Set **Release gate** as a required GitHub branch-protection check; it aggregates quality, performance, accessibility, coverage, and dependency-security outcomes.
