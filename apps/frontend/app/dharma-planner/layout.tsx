import type { ReactNode } from "react";
import { buildPageMetadata } from "../lib/seo";

export const metadata = buildPageMetadata({
  title: "Dharma Planner for Purpose-Aligned Goals and Intentions",
  description:
    "Plan purpose-aligned goals, intentions, action steps, and daily direction with a Dharma Planner built for steady spiritual discipline.",
  path: "/dharma-planner",
  keywords: ["purpose planner", "dharma goals", "intentional living"],
});

export default function DharmaPlannerLayout({ children }: { children: ReactNode }) {
  return children;
}
