import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import JsonLd from "@/app/components/JsonLd";
import ModuleLayout from "@/app/components/ModuleLayout";
import {
  getCommunityTopicData,
  type CommunityDataStatus,
  type CommunityPostSummary,
} from "@/app/lib/community/discourse-api";
import { absoluteUrl, buildPageMetadata, siteName } from "@/app/lib/seo";

export const revalidate = 300;

type CommunityTopicPageProps = {
  params: {
    slug: string;
    id: string;
  };
};

function buildTopicPath(slug: string, id: string): string {
  return `/community/t/${encodeURIComponent(slug)}/${encodeURIComponent(id)}`;
}

function fitDescription(value: string, maxLength = 170): string {
  const trimmed = value.replace(/\s+/g, " ").trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 3).replace(/\s+\S*$/, "").trim()}.`;
}

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

export async function generateMetadata({ params }: CommunityTopicPageProps): Promise<Metadata> {
  const data = await getCommunityTopicData(params.slug, params.id);
  const path = buildTopicPath(params.slug, params.id);

  if (!data) {
    return buildPageMetadata({
      title: "Buddhi Align Community Topic",
      description:
        "Read a Buddhi Align community discussion about spiritual practice, meditation, service, devotion, self-inquiry, dharma planning, and shared reflection.",
      path,
      keywords: ["Buddhi Align community topic", "spiritual practice discussion", "mindfulness forum"],
    });
  }

  const firstPost = data.topic.posts[0]?.excerpt;
  const description = fitDescription(
    firstPost
      ? `${firstPost} Read the Buddhi Align community discussion and reply with SSO.`
      : `Read ${data.topic.title}, a Buddhi Align community discussion for practice questions, reflection, and steady daily growth.`,
  );

  return buildPageMetadata({
    title: data.topic.title,
    description,
    path,
    keywords: [data.topic.title, "Buddhi Align community", "spiritual practice discussion"],
  });
}

function buildTopicJsonLd(data: NonNullable<Awaited<ReturnType<typeof getCommunityTopicData>>>, path: string) {
  const firstPost = data.topic.posts[0];

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "DiscussionForumPosting",
        "@id": `${absoluteUrl(path)}#discussion`,
        headline: data.topic.title,
        url: absoluteUrl(path),
        datePublished: data.topic.createdAt,
        articleBody: firstPost?.excerpt,
        author: firstPost
          ? {
              "@type": "Person",
              name: firstPost.name ?? firstPost.username,
            }
          : undefined,
        interactionStatistic: [
          data.topic.postsCount !== undefined
            ? {
                "@type": "InteractionCounter",
                interactionType: "https://schema.org/CommentAction",
                userInteractionCount: data.topic.postsCount,
              }
            : undefined,
          data.topic.likeCount !== undefined
            ? {
                "@type": "InteractionCounter",
                interactionType: "https://schema.org/LikeAction",
                userInteractionCount: data.topic.likeCount,
              }
            : undefined,
          data.topic.views !== undefined
            ? {
                "@type": "InteractionCounter",
                interactionType: "https://schema.org/ViewAction",
                userInteractionCount: data.topic.views,
              }
            : undefined,
        ].filter(Boolean),
        comment: data.topic.posts.slice(1, 6).map((post) => ({
          "@type": "Comment",
          text: post.excerpt,
          dateCreated: post.createdAt,
          author: {
            "@type": "Person",
            name: post.name ?? post.username,
          },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${absoluteUrl(path)}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: siteName,
            item: absoluteUrl("/"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Community",
            item: absoluteUrl("/community"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: data.topic.title,
            item: absoluteUrl(path),
          },
        ],
      },
    ],
  };
}

export default async function CommunityTopicPage({ params }: CommunityTopicPageProps) {
  const data = await getCommunityTopicData(params.slug, params.id);
  if (!data) notFound();

  const createdAt = formatDate(data.topic.createdAt);
  const path = buildTopicPath(params.slug, params.id);

  return (
    <ModuleLayout titleKey="community.title">
      <JsonLd data={buildTopicJsonLd(data, path)} />

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
