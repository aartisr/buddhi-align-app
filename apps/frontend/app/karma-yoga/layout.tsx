import type { ReactNode } from "react";
import { buildPageMetadata } from "../lib/seo";

export const metadata = buildPageMetadata({
  title: "Karma Yoga Tracker",
  description:
    "Log acts of service, reflect on their impact, and keep a clear record of your Karma Yoga practice.",
  path: "/karma-yoga",
  keywords: ["service journal", "karma yoga tracker", "daily seva"],
});

export default function KarmaYogaLayout({ children }: { children: ReactNode }) {
  return children;
}
