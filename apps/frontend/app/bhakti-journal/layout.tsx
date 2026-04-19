import type { ReactNode } from "react";
import { buildPageMetadata } from "../lib/seo";

export const metadata = buildPageMetadata({
  title: "Bhakti Journal",
  description:
    "Capture devotional reflections, gratitude, and heartfelt moments in a focused Bhakti practice journal.",
  path: "/bhakti-journal",
  keywords: ["devotional journal", "gratitude reflection", "bhakti practice"],
});

export default function BhaktiJournalLayout({ children }: { children: ReactNode }) {
  return children;
}
