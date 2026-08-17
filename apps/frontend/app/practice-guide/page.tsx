import Link from "next/link";

import JsonLd from "../components/JsonLd";
import ModuleLayout from "../components/ModuleLayout";
import PublicPageJsonLd from "../components/PublicPageJsonLd";
import { siteName, siteUrl } from "../lib/seo";

const days = [
  {
    day: "Day 1",
    title: "Choose one honest intention",
    theme: "Dharma",
    prompt: "What quality would make today a little more aligned—patience, courage, attention, or care? Name one action that expresses it.",
    practice: "Write one sentence beginning: “Today, I will practice…” Keep it small enough to carry into an ordinary day.",
    href: "/dharma-planner",
    cta: "Open Dharma Planner",
  },
  {
    day: "Day 2",
    title: "Sit with one quiet minute",
    theme: "Dhyana",
    prompt: "Where does your attention naturally settle when you pause? What helps you return when it wanders?",
    practice: "Set a one-minute timer. Notice the breath or another steady point of attention. Returning is the practice; there is nothing to achieve.",
    href: "/dhyana-meditation",
    cta: "Open Dhyana Meditation",
  },
  {
    day: "Day 3",
    title: "Offer one helpful action",
    theme: "Karma Yoga",
    prompt: "What small action could make someone else’s day lighter without needing recognition?",
    practice: "Do one useful thing with care: listen fully, lend a hand, or complete a task that supports a shared space. Afterwards, note what you learned.",
    href: "/karma-yoga",
    cta: "Open Karma Yoga",
  },
  {
    day: "Day 4",
    title: "Notice what is already here",
    theme: "Bhakti",
    prompt: "What person, place, memory, or ordinary comfort invites genuine gratitude today?",
    practice: "Write three specific details you appreciate. Let the entry be simple and sincere rather than polished.",
    href: "/bhakti-journal",
    cta: "Open Bhakti Journal",
  },
  {
    day: "Day 5",
    title: "Ask one kind question",
    theme: "Jnana",
    prompt: "What belief, reaction, or worry deserves curiosity instead of an immediate answer?",
    practice: "Write the question down. Notice what changes when you allow it to remain open for a few minutes.",
    href: "/jnana-reflection",
    cta: "Open Jnana Reflection",
  },
  {
    day: "Day 6",
    title: "Meet a pattern without blame",
    theme: "Vasana awareness",
    prompt: "What recurring moment—rushing, postponing, judging, withdrawing—would you like to understand more gently?",
    practice: "Name the situation, what you noticed, and one compassionate alternative you could try next time. Observation comes before change.",
    href: "/vasana-tracker",
    cta: "Open Vasana Tracker",
  },
  {
    day: "Day 7",
    title: "Review and choose your next small step",
    theme: "Reflection",
    prompt: "Which practice felt natural? Which one asked for care? What would make the next week feel sustainable?",
    practice: "Review your notes, celebrate one honest effort, and choose a single practice to repeat next week. Consistency grows through return, not perfection.",
    href: "/motivation-analytics",
    cta: "Open Motivation and Analytics",
  },
] as const;

export default function PracticeGuidePage() {
  const guideJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LearningResource",
        "@id": `${siteUrl}/practice-guide#learning-resource`,
        url: `${siteUrl}/practice-guide`,
        name: "7-Day Gentle Contemplative Practice Guide",
        description:
          "A free, adaptable seven-day introduction to intention, meditation, service, gratitude, self-inquiry, pattern awareness, and gentle reflection.",
        isAccessibleForFree: true,
        inLanguage: "en-US",
        educationalLevel: "Beginner",
        learningResourceType: "Practice guide",
        timeRequired: "P7D",
        publisher: { "@type": "Organization", name: "ForeverLotus" },
        author: { "@type": "Person", name: "Aarti S Ravikumar" },
        isPartOf: { "@type": "WebSite", name: siteName, url: siteUrl },
        teaches: days.map((item) => item.theme),
      },
      {
        "@type": "ItemList",
        "@id": `${siteUrl}/practice-guide#days`,
        name: "Seven days of gentle contemplative practice",
        itemListElement: days.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: `${item.day}: ${item.title}`,
          url: `${siteUrl}/practice-guide#day-${index + 1}`,
        })),
      },
    ],
  };

  return (
    <ModuleLayout titleKey="app.brand">
      <PublicPageJsonLd path="/practice-guide" />
      <JsonLd data={guideJsonLd} />

      <article className="max-w-5xl mx-auto mb-6" aria-labelledby="practice-guide-heading">
        <section className="app-surface-card p-5 sm:p-7 mb-6">
          <p className="app-guided-flow-kicker">Free practice resource</p>
          <h1 id="practice-guide-heading" className="app-panel-title text-2xl sm:text-3xl font-bold leading-tight">
            A gentle seven-day practice guide
          </h1>
          <p className="app-copy-soft text-sm sm:text-base mt-3 max-w-3xl">
            Begin or renew a contemplative routine with one small practice each day. Adapt every prompt to your
            tradition, circumstances, and energy. This guide supports reflection; it is not medical treatment,
            therapy, or a replacement for teachers, mentors, or spiritual guidance.
          </p>
          <div className="flex flex-wrap gap-2 mt-5">
            <a href="#day-1" className="app-guided-flow-primary-link">Start day one</a>
            <Link href="/share" className="app-guided-flow-link">Share this guide</Link>
          </div>
        </section>

        <section className="app-surface-card p-5 sm:p-6 mb-6" aria-labelledby="how-to-use-heading">
          <h2 id="how-to-use-heading" className="app-panel-title text-lg sm:text-xl font-bold leading-tight">How to use it</h2>
          <ol className="app-copy-soft text-sm sm:text-base mt-3 list-decimal pl-5 space-y-2 max-w-3xl">
            <li>Give each day five to ten quiet minutes, or shorten the practice to fit your day.</li>
            <li>Write a few words after each exercise—clarity matters more than length.</li>
            <li>Repeat any day that helps. This is a rhythm to return to, not a test to complete.</li>
          </ol>
        </section>

        <div className="grid gap-4" aria-label="Seven-day practice sequence">
          {days.map((item, index) => (
            <section key={item.day} id={`day-${index + 1}`} className="app-surface-card p-5 sm:p-6 scroll-mt-6" aria-labelledby={`day-${index + 1}-heading`}>
              <p className="app-guided-flow-kicker">{item.day} · {item.theme}</p>
              <h2 id={`day-${index + 1}-heading`} className="app-panel-title text-xl font-bold leading-tight">{item.title}</h2>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h3 className="font-semibold app-copy">Reflect</h3>
                  <p className="app-copy-soft text-sm sm:text-base mt-1">{item.prompt}</p>
                </div>
                <div>
                  <h3 className="font-semibold app-copy">Try</h3>
                  <p className="app-copy-soft text-sm sm:text-base mt-1">{item.practice}</p>
                </div>
              </div>
              <Link href={item.href} className="app-guided-flow-link inline-flex mt-4">{item.cta}</Link>
            </section>
          ))}
        </div>

        <section className="app-surface-card p-5 sm:p-6 mt-6" aria-labelledby="next-step-heading">
          <h2 id="next-step-heading" className="app-panel-title text-lg sm:text-xl font-bold leading-tight">Carry one practice forward</h2>
          <p className="app-copy-soft text-sm sm:text-base mt-2 max-w-3xl">
            Choose the practice that felt most honest and make it your starting point next week. Buddhi Align can
            help you keep a private record of what you notice, at your own pace.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <Link href="/" className="app-guided-flow-primary-link">Open Buddhi Align</Link>
            <Link href="/about" className="app-guided-flow-link">Learn about the daily loop</Link>
          </div>
        </section>
      </article>
    </ModuleLayout>
  );
}
