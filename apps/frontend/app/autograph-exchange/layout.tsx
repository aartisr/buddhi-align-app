import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { isAutographFeatureEnabled } from "@/app/lib/autographs/feature";
import { buildPageMetadata } from "@/app/lib/seo";
import "./autograph-exchange.css";

export const metadata = buildPageMetadata({
  title: "Autograph Exchange for Digital Keepsakes and School Messages",
  description:
    "Collect thoughtful autograph messages, school keepsakes, and community memories inside Buddhi Align without losing the calm guided experience of the main app.",
  path: "/autograph-exchange",
  keywords: [
    "digital autograph book",
    "school keepsakes",
    "memory messages",
    "student signatures",
  ],
});

export default function AutographExchangeLayout({ children }: { children: ReactNode }) {
  if (!isAutographFeatureEnabled()) {
    notFound();
  }

  return children;
}
