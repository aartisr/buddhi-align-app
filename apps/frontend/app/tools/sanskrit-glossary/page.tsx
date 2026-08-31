import React from "react";
import type { Metadata } from "next";
import SanskritGlossaryGuide from "../../components/SanskritGlossaryGuide";
import SiteFooter from "../../components/SiteFooter";

export const metadata: Metadata = {
  title: "Sanskrit Wisdom Lexicon & Etymology | Buddhi Align",
  description: "Explore the authentic Sanskrit roots and philosophical etymology of yogic concepts like Dharma, Dhyana, Karma, and Bhakti.",
  keywords: ["sanskrit glossary", "yoga terminology", "sanskrit roots", "dharma meaning", "dhyana", "vedic philosophy"],
  openGraph: {
    title: "Sanskrit Wisdom Lexicon",
    description: "Authentic Sanskrit roots and philosophical etymology of yogic concepts.",
    type: "website",
  },
};

export default function SanskritGlossaryPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-12 space-y-12">
        <header className="space-y-4 text-center mt-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-amber-950 dark:text-amber-50">
            Sanskrit Wisdom Lexicon
          </h1>
          <p className="text-lg text-amber-800/80 dark:text-amber-200/80 max-w-2xl mx-auto">
            Discover the precise scriptural definitions, root etymology, and authentic Vedic pronunciation of core philosophical concepts.
          </p>
        </header>
        
        <div className="bg-white dark:bg-[#120f0a] rounded-3xl p-2 sm:p-6 shadow-xl border border-stone-200 dark:border-amber-900/30">
          <SanskritGlossaryGuide />
        </div>

        <section className="prose prose-amber dark:prose-invert mx-auto py-12 text-stone-700 dark:text-stone-300">
          <h2>The Power of the Root (Dhatu)</h2>
          <p>
            In Sanskrit, every word is derived from a seed sound or root syllable known as a <em>Dhatu</em>. 
            Understanding the root provides a profound, multi-dimensional view of the word&apos;s true meaning. 
            For example, <em>Dharma</em> comes from the root <em>dhṛ</em>, which means &quot;to uphold&quot; or &quot;to sustain&quot;—revealing that Dharma is not just &quot;duty&quot;, but the universal principle that upholds harmony.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
