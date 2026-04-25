// Converted from next.config.ts to next.config.js for Next.js 14 compatibility

/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === 'development';

function normalizeExternalCommunityTarget(value) {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;

  try {
    const parsed = new URL(trimmed);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return undefined;
    }
    return parsed.toString().replace(/\/$/, '');
  } catch {
    return undefined;
  }
}

const communityProxyTarget = normalizeExternalCommunityTarget(process.env.COMMUNITY_PROXY_TARGET);
const appSecurityHeaderSource = communityProxyTarget ? '/((?!community(?:/|$)).*)' : '/(.*)';
const bingVerificationPath = '/6A06157D-A0A1-46BA-BA2B-439CD61864A3.txt';

const crawlerUtilityHeaders = [
  {
    source: bingVerificationPath,
    headers: [
      { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
      { key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=3600' },
    ],
  },
];

/** OWASP-recommended HTTP security headers */
const securityHeaders = [
  // Prevent browsers from MIME-sniffing a response from the declared content-type
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Clickjacking protection — only allow framing from same origin
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Control referrer information included with requests
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // DNS prefetching for performance
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  // Restrict browser feature access
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=()',
  },
  // Enforce HTTPS in production (1 year, include subdomains)
  ...(isDev ? [] : [{
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  }]),
  // Content Security Policy
  // Note: Next.js App Router requires 'unsafe-inline' for script/style due to RSC hydration
  // and inline event handlers. For a stricter policy, adopt nonce-based CSP via middleware.
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // unsafe-inline required for Next.js hydration scripts; unsafe-eval needed in dev only
      isDev
        ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.clarity.ms https://scripts.clarity.ms"
        : "script-src 'self' 'unsafe-inline' https://www.clarity.ms https://scripts.clarity.ms",
      "style-src 'self' 'unsafe-inline'",
      // Fonts are self-hosted via next/font at build time — no external CDN needed
      "font-src 'self' data:",
      // Allow images from auth providers, Shishu Bharati, and Awaricon badge host
      "img-src 'self' data: blob: https://lh3.googleusercontent.com https://avatars.githubusercontent.com https://graph.facebook.com https://www.shishubharati.net https://www.foreverlotus.com https://*.clarity.ms",
      // Supabase real-time + REST connections
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.clarity.ms",
      "frame-ancestors 'self'",
      "form-action 'self'",
      "base-uri 'self'",
      "object-src 'none'",
    ].join('; '),
  },
];

const nextConfig = {
  // Attach security headers to all routes
  async headers() {
    return [
      ...crawlerUtilityHeaders,
      {
        source: appSecurityHeaderSource,
        headers: securityHeaders,
      },
    ];
  },

  async rewrites() {
    if (!communityProxyTarget) {
      return [];
    }

    return {
      beforeFiles: [
        {
          source: '/community',
          destination: communityProxyTarget,
        },
        {
          source: '/community/:path*',
          destination: `${communityProxyTarget}/:path*`,
        },
      ],
    };
  },

  // Ensure local workspace packages written in TypeScript are transpiled by Next.js.
  transpilePackages: ['@aartisr/autograph-contract', '@aartisr/autograph-core', '@aartisr/autograph-feature', '@buddhi-align/data-access', '@buddhi-align/site-config', '@buddhi-align/shared-ui'],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "graph.facebook.com" },
      { protocol: "https", hostname: "www.shishubharati.net" },
      { protocol: "https", hostname: "www.foreverlotus.com" },
    ],
  },
};

module.exports = nextConfig;
