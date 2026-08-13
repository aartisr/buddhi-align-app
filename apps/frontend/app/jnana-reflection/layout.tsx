import type { ReactNode } from "react";
import PublicPageJsonLd from "../components/PublicPageJsonLd";
import { buildPageMetadata } from "../lib/seo";

export const metadata = buildPageMetadata({
  title: "Jnana Reflection Journal for Self-Inquiry and Insight",
  description:
    "Record insight, contemplation, self-inquiry, study notes, and wisdom questions in a structured Jnana Reflection journal for thoughtful review.",
  path: "/jnana-reflection",
  keywords: ["wisdom journal", "study reflection", "jnana contemplation"],
});

export default function JnanaReflectionLayout({ children }: { children: ReactNode }) {
  return <><PublicPageJsonLd path="/jnana-reflection" />{children}</>;
}
