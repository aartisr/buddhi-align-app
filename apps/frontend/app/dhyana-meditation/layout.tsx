import type { ReactNode } from "react";
import { buildPageMetadata } from "../lib/seo";

export const metadata = buildPageMetadata({
  title: "Dhyana Meditation Tracker for Daily Mindfulness Practice",
  description:
    "Track guided and self-led meditation sessions, duration, notes, and attention-building practice with a calm Dhyana Meditation workspace.",
  path: "/dhyana-meditation",
  keywords: ["meditation log", "dhyana tracker", "mindfulness practice"],
});

export default function DhyanaMeditationLayout({ children }: { children: ReactNode }) {
  return children;
}
