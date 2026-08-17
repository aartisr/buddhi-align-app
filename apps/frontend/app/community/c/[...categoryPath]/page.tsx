import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";

import JsonLd from "@/app/components/JsonLd";
import ModuleLayout from "@/app/components/ModuleLayout";
import { fitDescription, formatPublicDate } from "@/app/lib/content-format";
import {
  getCommunityCategoryData,
  type CommunityCategoryCard,
  type CommunityDataStatus,
  type CommunityTopicSummary,
} from "@/app/lib/community/discourse-api";
import { absoluteUrl, buildPageMetadata, siteName } from "@/app/lib/seo";

export const revalidate = 300;

const getCachedCommunityCategoryData = unstable_cache(
  (categoryPathKey: string) => {
    const categoryPath = categoryPathKey.split("/").filter(Boolean);
    return getCommunityCategoryData(categoryPath);
  },
  ["community-category"],
  { revalidate },
);

type CommunityCategoryPageProps = {
  params: {
    categoryPath?: string[];
  };
};

type CategoryGuide = {
  heading: string;
  introduction: string;
  prompts: string[];
  closing: string;
};

const CATEGORY_GUIDES: Record<string, CategoryGuide> = {
  "karma-yoga": {
    heading: "A place to reflect on service with care",
    introduction:
      "Karma Yoga is a space for conversations about purposeful action, service, and what we learn when we try to help without needing recognition. Share ordinary examples as well as larger commitments: supporting a neighbor, contributing to a group, listening well, or completing a task with attention. The aim is not to measure anyone’s goodness, but to notice how action, intention, and impact meet in daily life.",
    prompts: [
      "What small act of service felt meaningful this week, and what made it matter?",
      "What helped you act with less hurry, resentment, or expectation?",
      "Where could one practical next action make a shared space more caring?",
    ],
    closing:
      "When you reply, speak from your own experience and leave room for different circumstances. If you want a private place to record an action and its reflection, the Karma Yoga tracker is available inside Buddhi Align.",
  },
  "jnana-reflection": {
    heading: "A space for thoughtful questions and lived insight",
    introduction:
      "Jnana Reflection welcomes careful self-inquiry, study notes, and questions that may not have immediate answers. Bring a passage, observation, or question that has stayed with you, then describe what you notice without needing to force a conclusion. This community is for learning together with humility: clear language, honest uncertainty, and respect for the different teachers, traditions, and life experiences people bring.",
    prompts: [
      "What question has helped you look at a familiar experience differently?",
      "What insight from study or conversation would you like to examine more carefully?",
      "How might you hold a difficult question with curiosity instead of rushing to resolve it?",
    ],
    closing:
      "Offer ideas as invitations rather than final answers, and cite or name sources when that context helps. For private notes and longer inquiry, use Jnana Reflection in Buddhi Align.",
  },
  general: {
    heading: "A welcoming place to begin the conversation",
    introduction:
      "This is the general Buddhi Align community space for questions, introductions, and reflections that do not fit one practice area alone. You might share what brought you here, ask how someone begins with a small daily rhythm, or point to a resource that has been useful in your own life. Keep the focus on lived experience, practical care, and respectful conversation rather than on having the final word.",
    prompts: [
      "What small practice or routine has helped you return to what matters?",
      "What would make this community more useful or welcoming for someone new?",
      "Which Buddhi Align practice area would you like to explore next, and why?",
    ],
    closing:
      "Share only what feels appropriate for a public discussion, protect one another’s privacy, and use the relevant module room when a conversation becomes more specific. Buddhi Align supports personal reflection; it is not medical treatment, therapy, or a replacement for teachers or mentors.",
  },
};

function getCategoryGuide(slug: string): CategoryGuide {
  return CATEGORY_GUIDES[slug] ?? CATEGORY_GUIDES.general;
}

function buildCategoryPath(categoryPath: readonly string[] = []): string {
  return `/community/c/${categoryPath.map((segment) => encodeURIComponent(segment)).join("/")}`;
}

function buildCategoryPathKey(categoryPath: readonly string[] = []): string {
  return categoryPath.join("/");
}

function buildCategoryTitle(categoryName: string): string {
  const conciseTitle = `${categoryName} Community Discussion | Buddhi Align`;
  return conciseTitle.length >= 50
    ? conciseTitle
    : `${categoryName} Practice Community Discussion | Buddhi Align`;
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
  const bumpedAt = formatPublicDate(topic.bumpedAt ?? topic.createdAt);

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

export async function generateMetadata({ params }: CommunityCategoryPageProps): Promise<Metadata> {
  const categoryPath = params.categoryPath ?? [];
  const data = await getCachedCommunityCategoryData(buildCategoryPathKey(categoryPath));
  const path = categoryPath.length > 0 ? buildCategoryPath(categoryPath) : "/community";

  if (!data) {
    const title = "Buddhi Align Community Discussions and Practice Support";
    return {
      ...buildPageMetadata({
      title,
      description:
        "Browse Buddhi Align community discussions for spiritual practice, meditation, service, devotion, self-inquiry, dharma planning, and shared reflection.",
      path,
      keywords: ["Buddhi Align community", "spiritual practice forum", "mindfulness discussion"],
      }),
      title: { absolute: title },
    };
  }

  const title = buildCategoryTitle(data.category.name);
  const description = fitDescription(
    `${data.category.description} Join Buddhi Align discussion for practice questions, shared reflection, module support, and steady daily growth.`,
  );

  return {
    ...buildPageMetadata({
      title,
    description,
    path,
    keywords: [
      data.category.name,
      `${data.category.slug} discussion`,
      "Buddhi Align community",
      "spiritual practice forum",
    ],
    }),
    title: { absolute: title },
  };
}

function buildCategoryJsonLd(data: NonNullable<Awaited<ReturnType<typeof getCommunityCategoryData>>>, path: string) {
  const breadcrumbItems = [
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
  ];

  if (data.parentCategory && data.parentCategory.slug !== data.category.slug) {
    breadcrumbItems.push({
      "@type": "ListItem",
      position: breadcrumbItems.length + 1,
      name: data.parentCategory.name,
      item: absoluteUrl(data.parentCategory.href),
    });
  }

  breadcrumbItems.push({
    "@type": "ListItem",
    position: breadcrumbItems.length + 1,
    name: data.category.name,
    item: absoluteUrl(path),
  });

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${absoluteUrl(path)}#webpage`,
        url: absoluteUrl(path),
        name: data.category.name,
        description: data.category.description,
        isPartOf: {
          "@id": `${absoluteUrl("/")}#website`,
        },
        mainEntity: {
          "@type": "ItemList",
          name: `${data.category.name} recent discussions`,
          itemListElement: data.topics.map((topic, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: topic.title,
            url: absoluteUrl(topic.href),
            description: topic.excerpt,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${absoluteUrl(path)}#breadcrumb`,
        itemListElement: breadcrumbItems,
      },
    ],
  };
}

export default async function CommunityCategoryPage({ params }: CommunityCategoryPageProps) {
  const data = await getCachedCommunityCategoryData(buildCategoryPathKey(params.categoryPath ?? []));
  if (!data) notFound();
  const path = buildCategoryPath(params.categoryPath ?? []);
  const guide = getCategoryGuide(data.category.slug);

  return (
    <ModuleLayout titleKey="community.title">
      <JsonLd data={buildCategoryJsonLd(data, path)} />

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

        <section className="app-community-section app-surface-card p-5 sm:p-6" aria-labelledby="community-guide-heading">
          <div className="app-community-section-header">
            <p className="app-guided-flow-kicker">Before you post</p>
            <h3 id="community-guide-heading" className="app-panel-title text-lg sm:text-xl font-bold">
              {guide.heading}
            </h3>
          </div>
          <p className="app-copy-soft text-sm sm:text-base mt-3">{guide.introduction}</p>
          <div className="mt-4">
            <h4 className="font-semibold app-copy">Conversation starters</h4>
            <ul className="app-copy-soft text-sm sm:text-base mt-2 list-disc pl-5 space-y-2">
              {guide.prompts.map((prompt) => <li key={prompt}>{prompt}</li>)}
            </ul>
          </div>
          <p className="app-copy-soft text-sm sm:text-base mt-4">{guide.closing}</p>
        </section>

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
