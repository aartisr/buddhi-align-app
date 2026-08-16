const baseUrl = (process.env.LIVE_SITE_URL || "https://buddhi-align.foreverlotus.com").replace(/\/$/, "");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function get(path) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { "user-agent": "BuddhiAlignDiscoveryValidator/1.0" },
    redirect: "follow",
  });
  assert(response.ok, `${path} returned HTTP ${response.status}`);
  return response;
}

const homepage = await get("/");
const homepageHtml = await homepage.text();
assert(homepageHtml.includes("application/ld+json"), "Homepage is missing JSON-LD structured data");
assert(homepageHtml.includes("Aarti S Ravikumar"), "Homepage structured data is missing the canonical author");
assert(homepageHtml.includes("https://ai-aarti.com"), "Homepage structured data is missing the canonical author URL");

const [robots, sitemap, llms, manifest] = await Promise.all([
  get("/robots.txt").then((response) => response.text()),
  get("/sitemap.xml").then((response) => response.text()),
  get("/llms.txt").then((response) => response.text()),
  get("/manifest.webmanifest").then((response) => response.json()),
]);

assert(robots.includes(`${baseUrl}/sitemap.xml`), "robots.txt does not advertise the canonical sitemap");
assert(sitemap.includes(`${baseUrl}/about`), "Sitemap is missing a canonical public page");
assert(llms.includes("https://ai-aarti.com/"), "llms.txt is missing the canonical author URL");
assert(manifest.display === "standalone", "PWA manifest is not standalone");
assert(manifest.icons?.some((icon) => icon.purpose === "maskable"), "PWA manifest is missing a maskable icon");

console.log(`[live-discovery] Validated ${baseUrl}: homepage JSON-LD, robots, sitemap, llms.txt, and PWA manifest.`);
