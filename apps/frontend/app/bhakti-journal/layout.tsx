import type { ReactNode } from "react";
import { buildPageMetadata } from "../lib/seo";

export const metadata = buildPageMetadata({
  title: "Bhakti Journal for Devotion and Gratitude Practice",
  description:
    "Capture devotion, gratitude, prayerful reflection, and heartfelt practice in a Bhakti journal designed for consistent devotional growth and review.",
  path: "/bhakti-journal",
  keywords: ["devotional journal", "gratitude reflection", "bhakti practice"],
});

export default function BhaktiJournalLayout({ children }: { children: ReactNode }) {
  return children;
}
