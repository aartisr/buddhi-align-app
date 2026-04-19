import type { ReactNode } from "react";
import { buildNoIndexMetadata } from "../lib/seo";

export const metadata = buildNoIndexMetadata({
  title: "Admin Module",
  description: "Restricted Buddhi Align operations and diagnostics.",
  path: "/admin",
});

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
