import Link from "next/link";
import { notFound } from "next/navigation";

import ModuleLayout from "@/app/components/ModuleLayout";
import {
  getCommunityTopicData,
  type CommunityDataStatus,
  type CommunityPostSummary,
} from "@/app/lib/community/discourse-api";

export const revalidate = 300;

type CommunityTopicPageProps = {
  params: {
    slug: string;
    id: string;
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
      ? "Community integration needs configuration before this topic can load."
      : "This live topic is temporarily unavailable.";

  return (
    <p className="app-community-status" role="status">
      {message}
    </p>
  );
}

function PostExcerpt({ post }: { post: CommunityPostSummary }) {
  const createdAt = formatDate(post.createdAt);

  return (
    <article className="app-community-post">
      <header className="app-community-post-header">
        <div>
          <h3 className="app-community-post-author">{post.name ?? post.username}</h3>
          <p className="app-community-post-meta">
            @{post.username}
            {post.postNumber ? ` - post ${post.postNumber}` : ""}
            {createdAt ? ` - ${createdAt}` : ""}
          </p>
        </div>
      </header>
      <p className="app-community-post-copy">{post.excerpt}</p>
    </article>
  );
}

export default async function CommunityTopicPage({ params }: CommunityTopicPageProps) {
  const data = await getCommunityTopicData(params.slug, params.id);
  if (!data) notFound();

  const createdAt = formatDate(data.topic.createdAt);

  return (
    <ModuleLayout titleKey="community.title">
      <section className="app-community-shell max-w-5xl mx-auto" aria-labelledby="community-topic-heading">
        <nav className="app-community-breadcrumb" aria-label="Community breadcrumb">
          <Link href="/community">Community</Link>
        </nav>

        <div className="app-community-hero app-community-hero--compact">
          <p className="app-guided-flow-kicker">Topic</p>
          <h2 id="community-topic-heading" className="app-panel-title text-xl sm:text-2xl font-bold leading-tight">
            {data.topic.title}
          </h2>
          <div className="app-community-topic-meta app-community-topic-meta--inline">
            {data.topic.postsCount !== undefined ? <span>{data.topic.postsCount} posts</span> : null}
            {data.topic.views !== undefined ? <span>{data.topic.views} views</span> : null}
            {data.topic.likeCount !== undefined ? <span>{data.topic.likeCount} likes</span> : null}
            {createdAt ? <span>Started {createdAt}</span> : null}
          </div>
          {data.topic.externalUrl ? (
            <div className="app-community-actions">
              <a href={data.topic.externalUrl} className="app-guided-flow-primary-link">
                Reply with SSO
              </a>
            </div>
          ) : null}
        </div>

        <CommunityStatus status={data.status} />

        {data.topic.posts.length > 0 ? (
          <div className="app-community-post-list">
            {data.topic.posts.map((post) => (
              <PostExcerpt key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <p className="app-community-empty">The topic preview is not available here yet.</p>
        )}
      </section>
    </ModuleLayout>
  );
}
