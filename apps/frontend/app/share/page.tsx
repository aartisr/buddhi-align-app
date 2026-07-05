import Link from "next/link";

import EasyInviteCard from "../components/EasyInviteCard";
import FocusIntro from "../components/FocusIntro";
import JsonLd from "../components/JsonLd";
import LazyDetails from "../components/LazyDetails";
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

      <FocusIntro
        title="Share in seconds"
        summary="Pick a destination, send one link, and let people start immediately."
      />

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

      <LazyDetails summary="Optional caption library" className="app-surface-card max-w-5xl mx-auto mb-6 p-4 sm:p-6">
        <section className="app-share-snippets" aria-labelledby="share-caption-library">
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
      </LazyDetails>

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
