import type { ReactNode } from "react";
import { buildNoIndexMetadata } from "../lib/seo";

export const metadata = buildNoIndexMetadata({
  title: "Admin Access",
  description: "Protected access screen for Buddhi Align administration.",
  path: "/admin-access",
});

export default function AdminAccessLayout({ children }: { children: ReactNode }) {
  return children;
}
