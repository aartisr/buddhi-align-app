import type { ReactNode } from "react";
import { buildPageMetadata } from "../lib/seo";

export const metadata = buildPageMetadata({
  title: "Motivation Analytics Dashboard for Spiritual Practice Growth",
  description:
    "Review streaks, module activity, practice balance, and adaptive next steps with a Motivation Analytics dashboard for spiritual practice growth.",
  path: "/motivation-analytics",
  keywords: ["personal analytics", "practice dashboard", "motivation insights"],
});

export default function MotivationAnalyticsLayout({ children }: { children: ReactNode }) {
  return children;
}
