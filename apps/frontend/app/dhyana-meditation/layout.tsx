import type { ReactNode } from "react";
import { buildPageMetadata } from "../lib/seo";

export const metadata = buildPageMetadata({
  title: "Dhyana Meditation",
  description:
    "Track meditation sessions, combine guided and self-led practice, and build steadier attention over time.",
  path: "/dhyana-meditation",
  keywords: ["meditation log", "dhyana tracker", "mindfulness practice"],
});

export default function DhyanaMeditationLayout({ children }: { children: ReactNode }) {
  return children;
}
