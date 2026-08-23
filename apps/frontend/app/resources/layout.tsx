import { buildPageMetadata } from "../lib/seo";

export const metadata = buildPageMetadata({
  path: "/resources",
  title: "Free Contemplative Practice Resources and Partner Link Kit",
  description:
    "Explore free Buddhi Align practice resources, share a seven-day guide, and find clear descriptions for teachers, schools, and community partners.",
  keywords: [
    "contemplative practice resources",
    "spiritual practice guide",
    "meditation resources for groups",
  ],
  imageAlt: "Buddhi Align free contemplative practice resources",
});

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
