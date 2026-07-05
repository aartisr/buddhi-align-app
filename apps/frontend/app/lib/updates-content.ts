export type ProductUpdate = {
  id: string;
  date: string;
  title: string;
  summary: string;
  highlights: string[];
  links?: Array<{ label: string; href: string }>;
};

export const productUpdates: ProductUpdate[] = [
  {
    id: "2026-07-04-seo-ai-contrast",
    date: "2026-07-04",
    title: "Search, AI indexing, and contrast hardening pass",
    summary:
      "Added stronger crawler discovery signals, expanded canonical indexing references, and tightened cross-theme contrast safety for core action surfaces.",
    highlights: [
      "Added RSS feed endpoint and metadata discovery links.",
      "Expanded llms references and public route indexing coverage.",
      "Hardened color-token usage and added contrast regression tests.",
    ],
    links: [
      { label: "About", href: "/about" },
      { label: "RSS feed", href: "/feed.xml" },
      { label: "Share kit", href: "/share" },
    ],
  },
  {
    id: "2026-07-03-cognitive-load-reduction",
    date: "2026-07-03",
    title: "Cognitive-load reduction across core modules",
    summary:
      "Simplified high-traffic pages to action-first flows and moved long-form context to dedicated surfaces so users can act quickly with less friction.",
    highlights: [
      "Introduced streamlined intros and progressive disclosure patterns.",
      "Centralized richer context into About and support surfaces.",
      "Kept module workflows focused on a single next best action.",
    ],
    links: [
      { label: "Dashboard", href: "/" },
      { label: "About", href: "/about" },
    ],
  },
  {
    id: "2026-07-02-production-readiness",
    date: "2026-07-02",
    title: "Production readiness and quality gate stabilization",
    summary:
      "Stabilized lint, test, and build quality gates, and improved route-level reliability for an always-deployable baseline.",
    highlights: [
      "Resolved route and layout inconsistencies affecting builds.",
      "Expanded test confidence on homepage and shared surfaces.",
      "Maintained strict CI-compatible quality checks.",
    ],
    links: [
      { label: "Support", href: "/support" },
      { label: "Community", href: "/community" },
    ],
  },
];
