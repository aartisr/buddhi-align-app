import type { ReactNode } from "react";
import { buildNoIndexMetadata } from "../lib/seo";

export const metadata = buildNoIndexMetadata({
  title: "Buddhi Align Private Settings and Preferences",
  description:
    "Private Buddhi Align settings page for signed-in users to manage preferences, account-specific configuration, and personal practice workspace behavior.",
  path: "/settings",
});

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return children;
}
