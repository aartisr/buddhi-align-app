import { buildPageMetadata } from "../lib/seo";

export const metadata = buildPageMetadata({
  path: "/about",
  title: "About Buddhi Align",
  description:
    "Learn the Buddhi Align daily practice loop, core principles, module guide, and frequently asked questions in one canonical overview page.",
  keywords: [
    "Buddhi Align about",
    "contemplative practice framework",
    "spiritual app overview",
  ],
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
