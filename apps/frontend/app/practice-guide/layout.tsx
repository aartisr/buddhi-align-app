import { buildPageMetadata } from "../lib/seo";

export const metadata = buildPageMetadata({
  path: "/practice-guide",
  title: "7-Day Gentle Contemplative Practice Guide",
  description:
    "Follow a free seven-day contemplative practice guide for setting intentions, meditation, service, gratitude, self-inquiry, and gentle reflection.",
  keywords: [
    "seven day contemplative practice guide",
    "beginner spiritual practice guide",
    "daily reflection prompts",
  ],
  imageAlt: "Buddhi Align seven-day contemplative practice guide",
});

export default function PracticeGuideLayout({ children }: { children: React.ReactNode }) {
  return children;
}
