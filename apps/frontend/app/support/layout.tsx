import type { ReactNode } from "react";
import { buildPageMetadata } from "../lib/seo";

export const metadata = buildPageMetadata({
  title: "Buddhi Align Support and Website Issue Reporting",
  description:
    "Report Buddhi Align website issues, accessibility barriers, sign-in trouble, Autograph Exchange bugs, performance concerns, and content problems.",
  path: "/support",
  keywords: [
    "Buddhi Align support",
    "report website issue",
    "accessibility feedback",
    "Autograph Exchange support",
  ],
});

export default function SupportLayout({ children }: { children: ReactNode }) {
  return children;
}
