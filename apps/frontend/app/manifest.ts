import type { MetadataRoute } from "next";

/**
 * The canonical install contract. Keeping it in the App Router makes PWA
 * metadata type-safe and prevents a second, stale manifest from drifting in
 * the public directory.
 */
export const pwaManifest: MetadataRoute.Manifest = {
  name: "Buddhi Align App",
  short_name: "Buddhi Align",
  id: "/",
  description: "A spiritual journaling, meditation, and analytics app for steady self-development and reflective practice.",
  start_url: "/",
  scope: "/",
  display: "standalone",
  display_override: ["window-controls-overlay", "standalone", "minimal-ui"],
  orientation: "any",
  background_color: "#fcfefb",
  theme_color: "#244d42",
  categories: ["health", "lifestyle", "productivity"],
  lang: "en",
  dir: "ltr",
  prefer_related_applications: false,
  icons: [
    { src: "/favicon.ico", sizes: "16x16 32x32 48x48", type: "image/x-icon", purpose: "any" },
    { src: "/buddhi-align-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
    { src: "/buddhi-align-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    { src: "/buddhi-align-icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    { src: "/buddhi-align-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    { src: "/buddhi-align-icon-maskable.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
  ],
  shortcuts: [
    { name: "Dharma Planner", short_name: "Dharma", description: "Set an intention and choose a meaningful next action", url: "/dharma-planner", icons: [{ src: "/buddhi-align-icon-192.png", sizes: "192x192", type: "image/png" }] },
    { name: "Karma Yoga Tracker", short_name: "Karma Yoga", description: "Log your karma yoga practice", url: "/karma-yoga", icons: [{ src: "/buddhi-align-icon-192.png", sizes: "192x192", type: "image/png" }] },
    { name: "Bhakti Journal", short_name: "Bhakti", description: "Journal your devotional practice", url: "/bhakti-journal", icons: [{ src: "/buddhi-align-icon-192.png", sizes: "192x192", type: "image/png" }] },
    { name: "Dhyana Meditation", short_name: "Dhyana", description: "Track your meditation sessions", url: "/dhyana-meditation", icons: [{ src: "/buddhi-align-icon-192.png", sizes: "192x192", type: "image/png" }] },
    { name: "Motivation and Analytics", short_name: "Analytics", description: "Review your practice streaks and balance", url: "/motivation-analytics", icons: [{ src: "/buddhi-align-icon-192.png", sizes: "192x192", type: "image/png" }] },
    { name: "Buddhi Align Community", short_name: "Community", description: "Join Discourse-powered practice discussions", url: "/api/community/discourse/login?returnPath=/community", icons: [{ src: "/buddhi-align-icon-192.png", sizes: "192x192", type: "image/png" }] },
    { name: "Share Buddhi Align", short_name: "Share", description: "Invite others into the daily practice loop", url: "/share", icons: [{ src: "/buddhi-align-icon-192.png", sizes: "192x192", type: "image/png" }] },
  ],
};

export default function manifest(): MetadataRoute.Manifest {
  return pwaManifest;
}
