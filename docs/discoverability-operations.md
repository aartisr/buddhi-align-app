# Discoverability operations

The application automatically publishes canonical metadata, JSON-LD, `robots.txt`, `sitemap.xml`, RSS, `llms.txt`, and a PWA manifest. Together these cover technical SEO, answer-engine optimization (AEO), AI-answer context (often called AIO), generative-engine optimization (GEO), and accessible semantic content (AXO). `robots.txt` explicitly permits major search, answer, and generative-AI crawlers and has a wildcard rule for new compliant agents. These measures improve eligibility for discovery; no implementation can guarantee a crawler's indexing or an AI product's citation decision.

## Generic discoverability test

Use the dependency-free test against any public HTTP(S) deployment:

```bash
npm run test:discoverability -- https://example.com
```

It checks the HTML title, description, canonical URL, language, viewport, landmarks, social previews, valid JSON-LD, image alternatives, crawler directives, sitemap, and optional `llms.txt`. It exits nonzero only for failed requirements by default; add `--strict` to make recommendations fail CI, or `--require-llms` to require AI-readable context:

```bash
npm run test:discoverability -- https://example.com --path=/about --require-llms --strict
```

The existing `npm run validate:live-discovery` remains the product-specific production smoke test.

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
