import Link from "next/link";

import JsonLd from "../components/JsonLd";
import ModuleLayout from "../components/ModuleLayout";
import { siteName, siteUrl } from "../lib/seo";
import { productUpdates } from "../lib/updates-content";

export default function UpdatesPage() {
  const updatesJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${siteUrl}/updates#collection`,
        url: `${siteUrl}/updates`,
        name: `${siteName} updates`,
        description: "Official Buddhi Align release notes, quality updates, and product improvements.",
        isPartOf: {
          "@type": "WebSite",
          url: siteUrl,
          name: siteName,
        },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: productUpdates.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.title,
            url: `${siteUrl}/updates#${item.id}`,
            datePublished: item.date,
          })),
        },
      },
      ...productUpdates.map((item) => ({
        "@type": "CreativeWork",
        "@id": `${siteUrl}/updates#${item.id}`,
        name: item.title,
        datePublished: item.date,
        dateModified: item.date,
        description: item.summary,
        inLanguage: "en-US",
      })),
    ],
  };

  return (
    <ModuleLayout titleKey="app.brand">
      <JsonLd data={updatesJsonLd} />

      <section className="app-surface-card max-w-5xl mx-auto mb-6 p-5 sm:p-7" aria-labelledby="updates-heading">
        <p className="app-guided-flow-kicker">What is new</p>
        <h2 id="updates-heading" className="app-panel-title text-xl sm:text-2xl font-bold leading-tight">
          Product updates and release notes
        </h2>
        <p className="app-copy-soft text-sm sm:text-base mt-2 max-w-3xl">
          This stream captures meaningful improvements across product experience, reliability, accessibility,
          search visibility, and AI-discoverability.
        </p>
      </section>

      <section className="max-w-5xl mx-auto mb-6" aria-label="Release timeline">
        <div className="grid gap-3">
          {productUpdates.map((update) => (
            <article key={update.id} id={update.id} className="app-surface-card p-4 sm:p-5">
              <p className="app-guided-flow-kicker">{update.date}</p>
              <h3 className="app-panel-title text-lg sm:text-xl font-bold leading-tight">{update.title}</h3>
              <p className="app-copy-soft text-sm sm:text-base mt-2">{update.summary}</p>
              <ul className="app-copy-soft text-sm mt-3">
                {update.highlights.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              {update.links?.length ? (
                <div className="flex flex-wrap gap-2 mt-3">
                  {update.links.map((link) => (
                    <Link key={link.href + link.label} href={link.href} className="app-guided-flow-link">
                      {link.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </ModuleLayout>
  );
}
