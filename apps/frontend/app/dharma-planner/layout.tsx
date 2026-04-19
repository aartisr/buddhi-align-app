import type { ReactNode } from "react";
import { buildPageMetadata } from "../lib/seo";

export const metadata = buildPageMetadata({
  title: "Dharma Planner",
  description:
    "Turn intention into action with a Dharma planning workspace for goals, discipline, and purpose-aligned routines.",
  path: "/dharma-planner",
  keywords: ["purpose planner", "dharma goals", "intentional living"],
});

export default function DharmaPlannerLayout({ children }: { children: ReactNode }) {
  return children;
}
