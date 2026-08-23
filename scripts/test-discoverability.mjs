#!/usr/bin/env node

/**
 * A dependency-free, deployment-level discoverability check.
 *
 * Usage:
 *   node scripts/test-discoverability.mjs https://example.com
 *   node scripts/test-discoverability.mjs --url=https://example.com --path=/about --require-llms
 *
 * It verifies technical SEO, answer-engine/AI accessibility signals, and a
 * small set of semantic accessibility signals. It does not submit a site to
 * search engines or guarantee indexing, which remain external decisions.
 */

const args = process.argv.slice(2);
const readOption = (name) => {
  const inline = args.find((argument) => argument.startsWith(`--${name}=`));
  if (inline) return inline.slice(name.length + 3);
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] : undefined;
};
const hasFlag = (name) => args.includes(`--${name}`);

if (args.includes("--help") || args.includes("-h")) {
  console.log(`Usage: node scripts/test-discoverability.mjs <site-url> [options]

Options:
  --url=<site-url>       Alternative to the positional URL
  --path=<path>          Canonical page to inspect (default: /)
  --sitemap-path=<path>  Sitemap location (default: /sitemap.xml)
  --require-llms         Fail if /llms.txt is not published
  --strict               Treat recommendations as failures
  --timeout=<ms>         Request timeout (default: 15000)`);
  process.exit(0);
}

const inputUrl = readOption("url") ?? args.find((argument) => !argument.startsWith("-"));
if (!inputUrl) throw new Error("Provide a site URL. Run with --help for usage.");

const baseUrl = new URL(inputUrl);
if (!/^https?:$/.test(baseUrl.protocol)) throw new Error("Site URL must use http or https.");
baseUrl.pathname = "/";
baseUrl.search = "";
baseUrl.hash = "";

const pagePath = readOption("path") ?? "/";
const sitemapPath = readOption("sitemap-path") ?? "/sitemap.xml";
const timeoutMs = Number(readOption("timeout") ?? 15000);
if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new Error("--timeout must be a positive number.");

const findings = { passed: [], warnings: [], failures: [] };
const pass = (message) => findings.passed.push(message);
const warn = (message) => findings.warnings.push(message);
const fail = (message) => findings.failures.push(message);
const expectedPageUrl = new URL(pagePath, baseUrl).href;

async function fetchResource(path, accept = "text/html,application/xhtml+xml") {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(new URL(path, baseUrl), {
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "DiscoverabilityAudit/1.0", accept },
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

function metaContent(html, attribute, value) {
  const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const expression = new RegExp(
    `<meta[^>]*${attribute}=["']${escapedValue}["'][^>]*content=["']([^"']*)["'][^>]*>`,
    "i",
  );
  return expression.exec(html)?.[1] ?? "";
}

function robotsBlocksCrawler(robots, crawler) {
  const groups = robots.replace(/\r/g, "").split(/\n\s*\n/);
  return groups.some((group) => {
    const userAgents = [...group.matchAll(/^\s*user-agent\s*:\s*(.+)\s*$/gim)].map((match) => match[1].trim().toLowerCase());
    const matchesCrawler = userAgents.includes(crawler.toLowerCase()) || userAgents.includes("*");
    return matchesCrawler && /^\s*disallow\s*:\s*\/\s*$/im.test(group);
  });
}

async function inspectPage() {
  const response = await fetchResource(pagePath);
  if (!response.ok) {
    fail(`${pagePath} returned HTTP ${response.status}.`);
    return;
  }

  const robotsHeader = response.headers.get("x-robots-tag") ?? "";
  if (/noindex/i.test(robotsHeader)) fail(`${pagePath} sends X-Robots-Tag: noindex.`);
  else pass(`${pagePath} is reachable and has no noindex response header.`);

  const html = await response.text();
  const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1].replace(/\s+/g, " ").trim();
  if (!title) fail("Page is missing a document title.");
  else {
    pass("Document title is present.");
    if (title.length < 15 || title.length > 70) warn(`Title is ${title.length} characters; aim for roughly 15–70.`);
  }

  const description = metaContent(html, "name", "description");
  if (!description || !/<meta[^>]+name=["']description["']/i.test(html)) fail("Page is missing a meta description.");
  else {
    pass("Meta description is present.");
    if (description.length < 50 || description.length > 175) warn(`Meta description is ${description.length} characters; aim for roughly 50–175.`);
  }

  const canonical = /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i.exec(html)?.[1];
  if (!canonical) fail("Page is missing a canonical link.");
  else if (new URL(canonical, baseUrl).href !== expectedPageUrl) fail(`Canonical points to ${canonical}, not ${expectedPageUrl}.`);
  else pass("Canonical URL matches the inspected page.");

  if (/<html[^>]+lang=["'][^"']+["']/i.test(html)) pass("Document language is declared.");
  else fail("Document language is missing on <html>.");
  if (/<meta[^>]+name=["']viewport["']/i.test(html)) pass("Responsive viewport metadata is present.");
  else fail("Responsive viewport metadata is missing.");
  if (/<h1\b[^>]*>/i.test(html)) pass("A primary H1 is present.");
  else warn("No H1 was found; use one clear primary heading per page.");
  if (/<main\b[^>]*>/i.test(html)) pass("A semantic <main> landmark is present.");
  else warn("No <main> landmark found; this weakens accessibility and content extraction.");

  for (const property of ["og:title", "og:description", "og:url", "og:image"]) {
    if (metaContent(html, "property", property)) pass(`${property} is present.`);
    else warn(`${property} is missing; social and answer-engine previews may be incomplete.`);
  }
  if (metaContent(html, "name", "twitter:card")) pass("Twitter/X card metadata is present.");
  else warn("Twitter/X card metadata is missing.");

  const schemaBlocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  if (!schemaBlocks.length) fail("No JSON-LD structured data was found.");
  else {
    try {
      schemaBlocks.forEach((block) => JSON.parse(block[1]));
      pass(`Found ${schemaBlocks.length} valid JSON-LD block(s).`);
    } catch {
      fail("At least one JSON-LD block is not valid JSON.");
    }
  }

  const imagesWithoutAlt = [...html.matchAll(/<img\b(?![^>]*\balt=)[^>]*>/gi)].length;
  if (imagesWithoutAlt) warn(`${imagesWithoutAlt} image(s) have no alt attribute.`);
  else pass("All rendered <img> elements declare alt text (or alt=\"\").");
}

async function inspectCrawlAssets() {
  const [robotsResponse, sitemapResponse, llmsResponse] = await Promise.all([
    fetchResource("/robots.txt", "text/plain"),
    fetchResource(sitemapPath, "application/xml,text/xml"),
    fetchResource("/llms.txt", "text/plain"),
  ]);

  if (!robotsResponse.ok) fail(`/robots.txt returned HTTP ${robotsResponse.status}.`);
  else {
    const robots = await robotsResponse.text();
    const expectedSitemapUrl = new URL(sitemapPath, baseUrl).href;
    if (robots.includes(expectedSitemapUrl)) pass("robots.txt advertises the sitemap.");
    else fail(`robots.txt does not advertise ${expectedSitemapUrl}.`);
    for (const crawler of [
      "Googlebot",
      "Bingbot",
      "GPTBot",
      "Google-Extended",
      "OAI-SearchBot",
      "ClaudeBot",
      "anthropic-ai",
      "PerplexityBot",
      "cohere-ai",
      "Meta-ExternalAgent",
      "Amazonbot",
      "Bytespider",
    ]) {
      if (robotsBlocksCrawler(robots, crawler)) fail(`robots.txt blocks ${crawler} site-wide.`);
    }
    if (!findings.failures.some((message) => message.includes("robots.txt blocks"))) pass("Major search and AI crawlers are not site-wide blocked.");
  }

  if (!sitemapResponse.ok) fail(`${sitemapPath} returned HTTP ${sitemapResponse.status}.`);
  else {
    const sitemap = await sitemapResponse.text();
    if (!/<(?:urlset|sitemapindex)\b/i.test(sitemap)) fail(`${sitemapPath} is not a recognizable XML sitemap.`);
    else if (sitemap.includes(expectedPageUrl)) pass("Sitemap includes the inspected canonical URL.");
    else warn(`Sitemap does not include ${expectedPageUrl}; this is expected only for intentionally non-indexable pages.`);
  }

  if (!llmsResponse.ok) {
    const message = `/llms.txt returned HTTP ${llmsResponse.status}.`;
    if (hasFlag("require-llms")) fail(message);
    else warn(`${message} Publishing one is recommended for AI-answer context but is not a web standard.`);
  } else {
    const llms = await llmsResponse.text();
    if (/^#\s+.+/m.test(llms) && llms.length >= 120) pass("AI-readable llms.txt is published with substantive content.");
    else warn("llms.txt is present but is unusually sparse; include a clear summary and canonical source links.");
  }
}

await Promise.all([inspectPage(), inspectCrawlAssets()]);

for (const message of findings.passed) console.log(`✓ ${message}`);
for (const message of findings.warnings) console.warn(`! ${message}`);
for (const message of findings.failures) console.error(`✗ ${message}`);

const strictFailures = hasFlag("strict") ? findings.warnings.length : 0;
console.log(`\nDiscoverability audit: ${findings.passed.length} passed, ${findings.warnings.length} recommendation(s), ${findings.failures.length} failure(s).`);
process.exitCode = findings.failures.length || strictFailures ? 1 : 0;
