import type { ReactNode } from "react";
import { buildNoIndexMetadata } from "../lib/seo";

export const metadata = buildNoIndexMetadata({
  title: "Settings",
  description: "Private settings and preferences for Buddhi Align users.",
  path: "/settings",
});

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return children;
}
