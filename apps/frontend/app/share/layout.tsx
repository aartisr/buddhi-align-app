import type { ReactNode } from "react";
import { buildPageMetadata } from "../lib/seo";

export const metadata = buildPageMetadata({
  title: "Share Buddhi Align with Friends, Families, and Communities",
  description:
    "Use the Buddhi Align share kit to send concise descriptions, social captions, and invite links to friends, families, schools, and spiritual communities.",
  path: "/share",
  keywords: ["Buddhi Align share kit", "spiritual app invite", "mindfulness app for friends"],
});

export default function ShareLayout({ children }: { children: ReactNode }) {
  return children;
}
