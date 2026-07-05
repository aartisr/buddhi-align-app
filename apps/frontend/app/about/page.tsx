import Link from "next/link";

import JsonLd from "../components/JsonLd";
import ModuleLayout from "../components/ModuleLayout";
import {
  homepageFaq,
  homepageHighlights,
  publicPageProfiles,
} from "../lib/public-content";
import { siteName, siteUrl } from "../lib/seo";

const topRoutes = publicPageProfiles.filter((profile) => [
  "/dharma-planner",
  "/karma-yoga",
  "/jnana-reflection",
  "/dhyana-meditation",
  "/bhakti-journal",
  "/vasana-tracker",
  "/motivation-analytics",
].includes(profile.path));

export default function AboutPage() {
  const aboutPageJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${siteUrl}/about#about`,
        url: `${siteUrl}/about`,
        name: `About ${siteName}`,
        description:
          "Canonical overview of Buddhi Align, including purpose, core principles, module guide, and practical onboarding path.",
        isPartOf: {
          "@type": "WebSite",
          url: siteUrl,
          name: siteName,
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${siteUrl}/about#faq`,
        mainEntity: homepageFaq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };

  return (
    <ModuleLayout titleKey="app.brand">
      <JsonLd data={aboutPageJsonLd} />
      <section className="app-surface-card max-w-5xl mx-auto mb-6 p-5 sm:p-7" aria-labelledby="about-buddhi-align-heading">
        <p className="app-guided-flow-kicker">About</p>
        <h2 id="about-buddhi-align-heading" className="app-panel-title text-xl sm:text-2xl font-bold leading-tight">
          Why Buddhi Align exists
        </h2>
        <p className="app-copy-soft text-sm sm:text-base mt-2 max-w-3xl">
          Buddhi Align turns timeless inner-work principles into a practical daily rhythm: set intention, take meaningful action, reflect honestly, and review growth gently.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/" className="app-guided-flow-primary-link">Back to Dashboard</Link>
          <Link href="/dharma-planner" className="app-guided-flow-link">Start in Dharma Planner</Link>
        </div>
      </section>

      <section className="app-public-story max-w-5xl mx-auto mb-6" aria-labelledby="about-highlights-heading">
        <div className="app-public-story-header">
          <h2 id="about-highlights-heading" className="app-panel-title text-lg sm:text-xl font-bold leading-tight">
            Core principles
          </h2>
        </div>
        <div className="app-public-story-grid">
          {homepageHighlights.map((item) => (
            <article key={item.title} className="app-public-story-card">
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="app-module-index max-w-5xl mx-auto mb-6" aria-labelledby="about-routes-heading">
        <div className="app-module-index-header">
          <h2 id="about-routes-heading" className="app-panel-title text-lg sm:text-xl font-bold leading-tight">
            Module guide
          </h2>
        </div>
        <div className="app-module-index-grid">
          {topRoutes.map((profile) => (
            <Link key={profile.path} href={profile.path} className="app-module-index-link">
              <span>{profile.title}</span>
              <small>{profile.summary}</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="app-faq-section max-w-5xl mx-auto mb-6" aria-labelledby="about-faq-heading">
        <div className="app-faq-heading">
          <h2 id="about-faq-heading" className="app-panel-title text-lg sm:text-xl font-bold leading-tight">
            Frequently asked questions
          </h2>
        </div>
        <div className="app-faq-list">
          {homepageFaq.map((item) => (
            <details key={item.question} className="app-faq-item">
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </ModuleLayout>
  );
}
