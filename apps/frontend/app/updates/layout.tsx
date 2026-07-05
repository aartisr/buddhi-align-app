import { buildPageMetadata } from "../lib/seo";

export const metadata = buildPageMetadata({
  path: "/updates",
  title: "Buddhi Align Updates",
  description:
    "Read official Buddhi Align release notes, product improvements, and quality updates in one canonical public stream.",
  keywords: [
    "Buddhi Align release notes",
    "Buddhi Align updates",
    "Buddhi Align changelog",
  ],
});

export default function UpdatesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
