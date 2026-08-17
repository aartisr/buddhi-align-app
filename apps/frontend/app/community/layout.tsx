import type { ReactNode } from "react";
import { buildPageMetadata } from "../lib/seo";

const communityTitle = "Buddhi Align Community Discussions and Practice Support";

export const metadata = {
  ...buildPageMetadata({
  title: communityTitle,
  description:
    "Open Buddhi Align community discussions inside the app, with module spaces for practice questions, reflection, seva, meditation, and dharma planning.",
  path: "/community",
  keywords: [
    "Buddhi Align community",
    "spiritual practice community",
    "mindfulness discussion forum",
    "dharma reflection community",
  ],
  }),
  title: { absolute: communityTitle },
};

export default function CommunityLayout({ children }: { children: ReactNode }) {
  return children;
}
