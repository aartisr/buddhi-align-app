import type { ReactNode } from "react";
import { buildPageMetadata } from "../lib/seo";

export const metadata = buildPageMetadata({
  title: "Motivation and Analytics",
  description:
    "Review streaks, practice volume, and guided insights with a motivation and analytics dashboard for Buddhi Align.",
  path: "/motivation-analytics",
  keywords: ["personal analytics", "practice dashboard", "motivation insights"],
});

export default function MotivationAnalyticsLayout({ children }: { children: ReactNode }) {
  return children;
}
