import Link from "next/link";

import EasyInviteCard from "../components/EasyInviteCard";
import JsonLd from "../components/JsonLd";
import ModuleLayout from "../components/ModuleLayout";
import {
  publicPageProfiles,
  publicShareDestinations,
  shareSnippets,
} from "../lib/public-content";
import { buildSharePageJsonLd } from "../lib/seo";

const shareableRoutes = publicPageProfiles.filter((profile) => profile.path !== "/share");

export default function SharePage() {
  return (
    <ModuleLayout titleKey="share.title">
      <JsonLd data={buildSharePageJsonLd()} />

      <section className="app-share-hero max-w-5xl mx-auto mb-6" aria-labelledby="share-buddhi-align-intro">
        <p className="app-guided-flow-kicker">Share kit</p>
        <h2 id="share-buddhi-align-intro" className="app-panel-title text-xl sm:text-2xl font-bold leading-tight">
          Make the invitation effortless
        </h2>
        <p className="app-copy-soft text-sm sm:text-base mt-2">
          These snippets keep the message clear wherever Buddhi Align travels: search results, AI answers, texts, emails, classrooms, and community circles.
        </p>
      </section>

      <EasyInviteCard
        title="Invite someone into the daily loop"
        subtitle="Choose a module, then send a link that opens directly into a calm starting point."
        moduleOptions={publicShareDestinations}
        homeOptionLabel="Home (quick start)"
        moduleSelectorLabel="Share destination"
        emailFieldLabel="Email"
        phoneFieldLabel="Phone"
        emailPlaceholder="friend@example.com"
        phonePlaceholder="+1 555 123 4567"
        emailCta="Email invite"
        smsCta="Text invite"
        copyCta="Copy link"
        shareCta="Share"
        copiedLabel="Copied"
      />

      <section className="app-share-snippets max-w-5xl mx-auto mb-6" aria-labelledby="share-caption-library">
        <div className="app-share-section-header">
          <p className="app-guided-flow-kicker">Caption library</p>
          <h2 id="share-caption-library" className="app-panel-title text-lg sm:text-xl font-bold leading-tight">
            Copy that travels well
          </h2>
        </div>
        <div className="app-share-snippet-grid">
          {shareSnippets.map((snippet) => (
            <article key={snippet.label} className="app-share-snippet">
              <h3>{snippet.label}</h3>
              <p>{snippet.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="app-share-routes max-w-5xl mx-auto" aria-labelledby="canonical-share-routes">
        <div className="app-share-section-header">
          <p className="app-guided-flow-kicker">Canonical links</p>
          <h2 id="canonical-share-routes" className="app-panel-title text-lg sm:text-xl font-bold leading-tight">
            Send people to the page that matches their intent
          </h2>
        </div>
        <div className="app-share-route-list">
          {shareableRoutes.map((profile) => (
            <Link key={profile.path} href={profile.path} className="app-share-route">
              <span>{profile.title}</span>
              <small>{profile.description}</small>
            </Link>
          ))}
        </div>
      </section>
    </ModuleLayout>
  );
}
