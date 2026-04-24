import type { ReactNode } from "react";
import { buildPageMetadata } from "../lib/seo";

export const metadata = buildPageMetadata({
  title: "Vasana Tracker for Habit Patterns and Inner Growth",
  description:
    "Use the Vasana Tracker to notice recurring habits, tendencies, triggers, and patterns so inner growth can be observed with clarity and care.",
  path: "/vasana-tracker",
  keywords: ["habit reflection", "pattern tracker", "vasana journal"],
});

export default function VasanaTrackerLayout({ children }: { children: ReactNode }) {
  return children;
}
