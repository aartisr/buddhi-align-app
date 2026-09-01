"use client";
import React from "react";
import TanpuraSadhanaDrone from "../../components/TanpuraSadhanaDrone";
import SiteFooter from "../../components/SiteFooter";

export default function OnlineTanpuraPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-12 space-y-12">
        <header className="space-y-4 text-center mt-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-emerald-950 dark:text-emerald-50">
            Online Tanpura & Meditation Drone
          </h1>
          <p className="text-lg text-emerald-800/80 dark:text-emerald-200/80 max-w-2xl mx-auto">
            A free, studio-quality acoustic Tanpura and singing bowl synthesizer. 
            Use this tool to find your center, practice vocal exercises, or deepen your meditation.
          </p>
        </header>
        
        <div className="bg-white dark:bg-[#071611] rounded-3xl p-2 sm:p-6 shadow-xl border border-stone-200 dark:border-emerald-900/30">
          <TanpuraSadhanaDrone />
        </div>

        <section className="prose prose-emerald dark:prose-invert mx-auto py-12 text-stone-700 dark:text-stone-300">
          <h2>Why practice with a Tanpura?</h2>
          <p>
            The Tanpura (or Tambura) provides a rich, harmonic drone that forms the foundation of Indian classical music. 
            Beyond music, its continuous, resonant frequencies help calm the mind (Chitta Vritti Nirodha) and anchor your awareness during Dhyana (meditation) and chanting.
          </p>
          <h3>How to use this tool:</h3>
          <ul>
            <li>Select your root pitch (C#, D, G#, or A 432Hz).</li>
            <li>Choose your preferred Vadi swara (Pancham / Pa or Madhyam / Ma).</li>
            <li>Enable the Tibetan singing bowls for periodic interval mindfulness bells.</li>
          </ul>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
