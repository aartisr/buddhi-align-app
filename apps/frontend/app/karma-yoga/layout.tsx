import type { ReactNode } from "react";
import { buildPageMetadata } from "../lib/seo";

export const metadata = buildPageMetadata({
  title: "Karma Yoga Service Journal and Seva Tracker",
  description:
    "Use the Karma Yoga tracker to log selfless action, seva, service impact, and reflection so meaningful work becomes a steady spiritual practice.",
  path: "/karma-yoga",
  keywords: ["service journal", "karma yoga tracker", "daily seva"],
});

export default function KarmaYogaLayout({ children }: { children: ReactNode }) {
  return children;
}
