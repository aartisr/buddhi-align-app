import type { ReactNode } from "react";
import { buildNoIndexMetadata } from "../lib/seo";

export const metadata = buildNoIndexMetadata({
  title: "Buddhi Align Restricted Operations and Diagnostics Console",
  description:
    "Private Buddhi Align operations console for authorized administrators to review diagnostics, incident context, and protected production support signals.",
  path: "/admin",
});

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
