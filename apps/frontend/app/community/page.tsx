import Link from "next/link";

import ModuleLayout from "../components/ModuleLayout";
import JsonLd from "../components/JsonLd";
import {
  getCommunityOverviewData,
  type CommunityCategoryCard,
  type CommunityDataStatus,
} from "../lib/community/discourse-api";
import { publicPageProfileByPath } from "../lib/public-content";
import { absoluteUrl } from "../lib/seo";

export const revalidate = 300;

function buildCommunityJsonLd(categories: CommunityCategoryCard[]) {
  const profile = publicPageProfileByPath.get("/community");
  if (!profile) return null;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: profile.title,
    description: profile.description,
    url: absoluteUrl("/community"),
    mainEntity: {
      "@type": "ItemList",
      name: "Buddhi Align community categories",
      itemListElement: categories.map((category, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: category.name,
        url: absoluteUrl(category.href),
        description: category.description,
      })),
    },
  };
}

function CommunityStatus({ status }: { status: CommunityDataStatus }) {
  if (status === "ready") return null;

  const message = status === "disabled"
    ? "Community integration is not enabled in this environment yet."
    : status === "misconfigured"
      ? "Community integration needs configuration before live discussions can load."
      : "Live community discussions are temporarily unavailable, so the module spaces below are shown as a fallback.";

  return (
    <p className="app-community-status" role="status">
      {message}
    </p>
  );
}

function CategoryCard({ category }: { category: CommunityCategoryCard }) {
  return (
    <Link
      href={category.href}
      className="app-community-card"
      style={category.color ? { borderColor: category.color } : undefined}
    >
      <span className="app-community-card-icon" aria-hidden>{category.icon}</span>
      <span className="app-community-card-title">{category.name}</span>
      <span className="app-community-card-copy">{category.description}</span>
      <span className="app-community-card-meta">
        {category.topicCount !== undefined ? `${category.topicCount} topics` : "Open space"}
        {category.postCount !== undefined ? ` - ${category.postCount} posts` : ""}
      </span>
    </Link>
  );
}

export default async function CommunityPage() {
  const data = await getCommunityOverviewData();

  return (
    <ModuleLayout titleKey="community.title">
      <JsonLd data={buildCommunityJsonLd(data.categories)} />

      <section className="app-community-shell max-w-6xl mx-auto" aria-labelledby="community-home-heading">
        <div className="app-community-hero">
          <p className="app-guided-flow-kicker">Community</p>
          <h2 id="community-home-heading" className="app-panel-title text-xl sm:text-2xl font-bold leading-tight">
            Practice together without leaving Buddhi Align
          </h2>
          <p className="app-copy-soft text-sm sm:text-base mt-2">
            Browse module discussions, read recent topics, and move into Discourse SSO only when you want to reply or manage the full thread.
          </p>
          <div className="app-community-actions">
            <Link href="/sign-in?callbackUrl=%2Fcommunity" className="app-guided-flow-primary-link">
              Sign in for SSO
            </Link>
            {data.parentCategory?.externalUrl ? (
              <a href={data.parentCategory.externalUrl} className="app-guided-flow-link">
                Open full forum
              </a>
            ) : null}
          </div>
        </div>

        <CommunityStatus status={data.status} />

        <div className="app-community-grid" aria-label="Community module spaces">
          {data.categories.map((category) => (
            <CategoryCard key={category.slug} category={category} />
          ))}
        </div>
      </section>
    </ModuleLayout>
  );
}
