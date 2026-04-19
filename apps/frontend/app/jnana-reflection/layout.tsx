import type { ReactNode } from "react";
import { buildPageMetadata } from "../lib/seo";

export const metadata = buildPageMetadata({
  title: "Jnana Reflection",
  description:
    "Record insights, contemplation, and study notes in a Jnana reflection journal designed for thoughtful review.",
  path: "/jnana-reflection",
  keywords: ["wisdom journal", "study reflection", "jnana contemplation"],
});

export default function JnanaReflectionLayout({ children }: { children: ReactNode }) {
  return children;
}
