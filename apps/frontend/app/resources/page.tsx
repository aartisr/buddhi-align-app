import Link from "next/link";
import JsonLd from "../components/JsonLd";
import ModuleLayout from "../components/ModuleLayout";
import PublicPageJsonLd from "../components/PublicPageJsonLd";
import PrintableSadhanaReview from "../components/PrintableSadhanaReview";
import SanskritGlossaryGuide from "../components/SanskritGlossaryGuide";
import { siteUrl } from "../lib/seo";

const resources = [
  {
    title: "7-Day Gentle Contemplative Practice Guide",
    description: "A free, adaptable sequence of brief prompts for intention, meditation, service, gratitude, self-inquiry, and reflection.",
    href: "/practice-guide",
    cta: "Read the free guide",
  },
  {
    title: "Buddhi Align share kit",
    description: "Short, accurate descriptions and invitations that make it easy to introduce the app to a class, group, family, or friend.",
    href: "/share",
    cta: "Open the share kit",
  },
  {
    title: "How the daily practice loop works",
    description: "A clear overview of the plan, practice, reflect, and review framework behind Buddhi Align.",
    href: "/about",
    cta: "Learn about the framework",
  },
] as const;

export default function ResourcesPage() {
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${siteUrl}/resources#collection`,
        url: `${siteUrl}/resources`,
        name: "Buddhi Align free contemplative practice resources",
        description: "Free, shareable resources for people beginning or supporting a reflective daily practice.",
        isAccessibleForFree: true,
        inLanguage: "en-US",
        hasPart: resources.map((resource) => ({
          "@type": "LearningResource",
          name: resource.title,
          url: `${siteUrl}${resource.href}`,
          isAccessibleForFree: true,
        })),
      },
    ],
  };

  return (
    <ModuleLayout titleKey="app.brand">
      <PublicPageJsonLd path="/resources" />
      <JsonLd data={collectionJsonLd} />
      <article className="max-w-5xl mx-auto mb-6 space-y-6" aria-labelledby="resources-heading">
        <section className="app-surface-card p-5 sm:p-7">
          <p className="app-guided-flow-kicker">Free public resources</p>
          <h1 id="resources-heading" className="app-panel-title text-2xl sm:text-3xl font-bold leading-tight">
            Practical resources for a steadier daily practice
          </h1>
          <p className="app-copy-soft text-sm sm:text-base mt-3 max-w-3xl">
            These free materials are made to be useful on their own and easy for teachers, community leaders, and
            resource editors to share. They support reflection and practice; they are not medical treatment, therapy,
            or a replacement for teachers, mentors, or spiritual guidance.
          </p>
        </section>

        {/* 10/10 Interactive Feature: Printable Monthly Sadhana Worksheet */}
        <section aria-labelledby="printable-sadhana-heading">
          <PrintableSadhanaReview />
        </section>

        {/* 10/10 Interactive Feature: Sanskrit Philosophical Lexicon */}
        <section aria-labelledby="sanskrit-glossary-heading">
          <SanskritGlossaryGuide />
        </section>

        <section className="grid gap-4 sm:grid-cols-3" aria-label="Free Buddhi Align resources">
          {resources.map((resource) => (
            <section key={resource.href} className="app-surface-card p-5 sm:p-6 flex flex-col">
              <h2 className="app-panel-title text-lg font-bold leading-tight">{resource.title}</h2>
              <p className="app-copy-soft text-sm sm:text-base mt-3 flex-1">{resource.description}</p>
              <Link href={resource.href} className="app-guided-flow-link inline-flex mt-5">{resource.cta}</Link>
            </section>
          ))}
        </section>

        <section className="app-surface-card p-5 sm:p-6" aria-labelledby="partner-kit-heading">
          <p className="app-guided-flow-kicker">For partners and resource pages</p>
          <h2 id="partner-kit-heading" className="app-panel-title text-xl font-bold leading-tight">
            Suggested description for a link or listing
          </h2>
          <p className="app-copy-soft text-sm sm:text-base mt-3 max-w-3xl">
            Buddhi Align is a calm contemplative-practice app that helps people plan an intention, record meaningful
            practice, reflect on insight, and review growth over time. Its free seven-day guide offers a gentle place
            to begin.
          </p>
          <div className="flex flex-wrap gap-2 mt-5">
            <Link href="/practice-guide" className="app-guided-flow-primary-link">Link to the practice guide</Link>
            <Link href="/share" className="app-guided-flow-link">Use a different description</Link>
          </div>
        </section>
      </article>
    </ModuleLayout>
  );
}
