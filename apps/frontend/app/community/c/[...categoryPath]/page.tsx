import Link from "next/link";
import { notFound } from "next/navigation";

import ModuleLayout from "@/app/components/ModuleLayout";
import {
  getCommunityCategoryData,
  type CommunityCategoryCard,
  type CommunityDataStatus,
  type CommunityTopicSummary,
} from "@/app/lib/community/discourse-api";

export const revalidate = 300;

type CommunityCategoryPageProps = {
  params: {
    categoryPath?: string[];
  };
};

function formatDate(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function CommunityStatus({ status }: { status: CommunityDataStatus }) {
  if (status === "ready") return null;

  const message = status === "disabled"
    ? "Community integration is not enabled in this environment yet."
    : status === "misconfigured"
      ? "Community integration needs configuration before live topics can load."
      : "Live topics are temporarily unavailable for this space.";

  return (
    <p className="app-community-status" role="status">
      {message}
    </p>
  );
}

function SubcategoryCard({ category }: { category: CommunityCategoryCard }) {
  return (
    <Link
      href={category.href}
      className="app-community-card app-community-card--compact"
      style={category.color ? { borderColor: category.color } : undefined}
    >
      <span className="app-community-card-icon" aria-hidden>{category.icon}</span>
      <span className="app-community-card-title">{category.name}</span>
      <span className="app-community-card-copy">{category.description}</span>
    </Link>
  );
}

function TopicRow({ topic }: { topic: CommunityTopicSummary }) {
  const bumpedAt = formatDate(topic.bumpedAt ?? topic.createdAt);

  return (
    <article className="app-community-topic">
      <div>
        <Link href={topic.href} className="app-community-topic-title">
          {topic.pinned ? <span aria-label="Pinned topic">Pinned: </span> : null}
          {topic.title}
        </Link>
        {topic.excerpt ? <p className="app-community-topic-excerpt">{topic.excerpt}</p> : null}
      </div>
      <div className="app-community-topic-meta">
        <span>{topic.postsCount ?? 0} posts</span>
        {topic.views !== undefined ? <span>{topic.views} views</span> : null}
        {topic.likeCount !== undefined ? <span>{topic.likeCount} likes</span> : null}
        {bumpedAt ? <span>Updated {bumpedAt}</span> : null}
        {topic.closed ? <span>Closed</span> : null}
      </div>
    </article>
  );
}

export default async function CommunityCategoryPage({ params }: CommunityCategoryPageProps) {
  const data = await getCommunityCategoryData(params.categoryPath ?? []);
  if (!data) notFound();

  return (
    <ModuleLayout titleKey="community.title">
      <section className="app-community-shell max-w-6xl mx-auto" aria-labelledby="community-category-heading">
        <nav className="app-community-breadcrumb" aria-label="Community breadcrumb">
          <Link href="/community">Community</Link>
          {data.parentCategory && data.parentCategory.slug !== data.category.slug ? (
            <>
              <span aria-hidden>/</span>
              <Link href={data.parentCategory.href}>{data.parentCategory.name}</Link>
            </>
          ) : null}
        </nav>

        <div className="app-community-hero app-community-hero--compact">
          <p className="app-guided-flow-kicker">Discussion space</p>
          <h2 id="community-category-heading" className="app-panel-title text-xl sm:text-2xl font-bold leading-tight">
            {data.category.name}
          </h2>
          <p className="app-copy-soft text-sm sm:text-base mt-2">
            {data.category.description}
          </p>
          {data.category.externalUrl ? (
            <div className="app-community-actions">
              <a href={data.category.externalUrl} className="app-guided-flow-link">
                Open full category
              </a>
            </div>
          ) : null}
        </div>

        <CommunityStatus status={data.status} />

        {data.subcategories.length > 0 ? (
          <section className="app-community-section" aria-labelledby="community-subcategories-heading">
            <div className="app-community-section-header">
              <p className="app-guided-flow-kicker">Spaces</p>
              <h3 id="community-subcategories-heading" className="app-panel-title text-lg sm:text-xl font-bold">
                Module rooms
              </h3>
            </div>
            <div className="app-community-grid">
              {data.subcategories.map((category) => (
                <SubcategoryCard key={category.slug} category={category} />
              ))}
            </div>
          </section>
        ) : null}

        <section className="app-community-section" aria-labelledby="community-topics-heading">
          <div className="app-community-section-header">
            <p className="app-guided-flow-kicker">Topics</p>
            <h3 id="community-topics-heading" className="app-panel-title text-lg sm:text-xl font-bold">
              Recent discussions
            </h3>
          </div>
          {data.topics.length > 0 ? (
            <div className="app-community-topic-list">
              {data.topics.map((topic) => (
                <TopicRow key={topic.id} topic={topic} />
              ))}
            </div>
          ) : (
            <p className="app-community-empty">No topics are available here yet.</p>
          )}
        </section>
      </section>
    </ModuleLayout>
  );
}
