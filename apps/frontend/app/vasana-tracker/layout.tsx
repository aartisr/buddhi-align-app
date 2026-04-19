import type { ReactNode } from "react";
import { buildPageMetadata } from "../lib/seo";

export const metadata = buildPageMetadata({
  title: "Vasana Tracker",
  description:
    "Notice recurring habits and tendencies, document them clearly, and support steady change with reflective tracking.",
  path: "/vasana-tracker",
  keywords: ["habit reflection", "pattern tracker", "vasana journal"],
});

export default function VasanaTrackerLayout({ children }: { children: ReactNode }) {
  return children;
}
