import type { ReactNode } from "react";
import JsonLd from "../components/JsonLd";
import { buildMotivationAnalyticsJsonLd, buildPageMetadata, guidedTourVideo } from "../lib/seo";

export const metadata = buildPageMetadata({
  title: "Motivation Analytics Dashboard for Spiritual Practice Growth",
  description:
    "Review streaks, module activity, guided tour video, practice balance, and adaptive next steps with a spiritual growth analytics dashboard.",
  path: "/motivation-analytics",
  keywords: ["personal analytics", "practice dashboard", "motivation insights", "guided app tour"],
  imagePath: guidedTourVideo.thumbnailPath,
  imageAlt: "Buddhi Align guided tour showing dashboard, Autograph Exchange, community, and analytics",
  video: {
    contentPath: guidedTourVideo.contentPath,
    type: guidedTourVideo.type,
    width: guidedTourVideo.width,
    height: guidedTourVideo.height,
  },
});

export default function MotivationAnalyticsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd data={buildMotivationAnalyticsJsonLd()} />
      {children}
    </>
  );
}
