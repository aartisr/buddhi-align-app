const FALLBACK_SITE_URL = "https://buddhi-align.vercel.app";

function normalizeUrl(url: string): string {
  return url.replace(/\/$/, "");
}

export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) {
    return normalizeUrl(explicit);
  }

  // VERCEL_PROJECT_PRODUCTION_URL is stable for production deployments.
  const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelProduction) {
    return normalizeUrl(`https://${vercelProduction}`);
  }

  // VERCEL_URL is available for preview deployments.
  const vercelPreview = process.env.VERCEL_URL;
  if (vercelPreview) {
    return normalizeUrl(`https://${vercelPreview}`);
  }

  return FALLBACK_SITE_URL;
}
