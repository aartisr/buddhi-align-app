import type { ReactNode } from "react";
import { buildPageMetadata } from "../lib/seo";

export const metadata = buildPageMetadata({
  title: "Buddhi Align Community",
  description:
    "Open Buddhi Align community discussions inside the app, with module spaces for practice questions, reflection, seva, meditation, and dharma planning.",
  path: "/community",
  keywords: [
    "Buddhi Align community",
    "spiritual practice community",
    "mindfulness discussion forum",
    "dharma reflection community",
  ],
});

export default function CommunityLayout({ children }: { children: ReactNode }) {
  return children;
}
