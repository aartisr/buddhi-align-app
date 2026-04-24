import type { ReactNode } from "react";
import { buildPageMetadata } from "../lib/seo";

export const metadata = buildPageMetadata({
  title: "Share Buddhi Align",
  description:
    "A share kit with concise Buddhi Align descriptions, social captions, and invite links for friends, families, schools, and spiritual communities.",
  path: "/share",
  keywords: ["Buddhi Align share kit", "spiritual app invite", "mindfulness app for friends"],
});

export default function ShareLayout({ children }: { children: ReactNode }) {
  return children;
}
