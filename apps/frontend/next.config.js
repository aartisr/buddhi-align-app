// Converted from next.config.ts to next.config.js for Next.js 14 compatibility

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure local workspace packages written in TypeScript are transpiled by Next.js.
  transpilePackages: ['@buddhi-align/data-access', '@buddhi-align/site-config', '@buddhi-align/shared-ui'],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "graph.facebook.com" },
    ],
  },
};

module.exports = nextConfig;
