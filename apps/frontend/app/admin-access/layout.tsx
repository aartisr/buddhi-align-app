import type { ReactNode } from "react";
import { buildNoIndexMetadata } from "../lib/seo";

export const metadata = buildNoIndexMetadata({
  title: "Buddhi Align Administration Access Gate",
  description:
    "Protected Buddhi Align administration access screen for authorized maintainers who manage operational settings, diagnostics, and secure admin workflows.",
  path: "/admin-access",
});

export default function AdminAccessLayout({ children }: { children: ReactNode }) {
  return children;
}
