"use client";

import React, { useState, useRef, useEffect } from "react";

export interface SanskritTerm {
  sanskrit: string;
  transliteration: string;
  rootEtymology: string;
  category: "Pillar" | "Epistemology" | "Discipline" | "State";
  meaning: string;
  philosophicalContext: string;
  canonicalReference: string;
  baseFrequency: number; // Hz for Vedic chant intonation
}

export const CANONICAL_SANSKRIT_TERMS: SanskritTerm[] = [
  {
    sanskrit: "बुद्धि",
    transliteration: "Buddhi",
    rootEtymology: "From root 'budh' (to awaken, perceive, discern)",
    category: "Epistemology",
    meaning: "Higher intuitive intellect, luminous discernment, cognitive clarity",
    philosophicalContext: "In Sankhya and Vedanta, Buddhi is the closest cognitive faculty to pure Consciousness (Purusha/Atman), capable of distinguishing truth from projection.",
    canonicalReference: "Katha Upanishad 1.3.3: 'Know the Self as the rider, the body as chariot, and Buddhi as the charioteer.'",
    baseFrequency: 261.63 // C4
  },
  {
    sanskrit: "धर्म",
    transliteration: "Dharma",
    rootEtymology: "From root 'dhṛ' (to uphold, sustain, integrate)",
    category: "Pillar",
    meaning: "Cosmic order, inherent nature, righteous living, ethical duty",
    philosophicalContext: "Dharma represents the harmonious universal law that sustains all beings. Living in Dharma means aligning personal action with universal flourishing.",
    canonicalReference: "Mahabharata Karna Parva: 'Dharma sustains society; that which has the power to uphold is Dharma.'",
    baseFrequency: 293.66 // D4
  },
  {
    sanskrit: "कर्म योग",
    transliteration: "Karma Yoga",
    rootEtymology: "From 'kṛ' (to act) + 'yuj' (to unite, integrate)",
    category: "Pillar",
    meaning: "Yoga of selfless action, consecrated work without anxious attachment to fruit",
    philosophicalContext: "Purifies the mind (Chitta Shuddhi) by converting routine labor into consecrated offering, freeing the practitioner from greed and fear.",
    canonicalReference: "Bhagavad Gita 2.47: 'Karmanyevadhikaraste ma phaleshu kadachana' (Your right is to action alone, never to its fruit).",
    baseFrequency: 329.63 // E4
  },
  {
    sanskrit: "भक्ति",
    transliteration: "Bhakti",
    rootEtymology: "From root 'bhaj' (to share, adore, belong, revere)",
    category: "Pillar",
    meaning: "Devotional surrender, sacred love, unshakeable gratitude for existence",
    philosophicalContext: "Transmutes emotional energy into transcendent reverence, dissolving egoistic isolation through heartfelt intimacy with the Divine.",
    canonicalReference: "Narada Bhakti Sutra 1.2: 'Sa tvasmin parama-prema-rupa' (It is of the nature of supreme love toward That).",
    baseFrequency: 349.23 // F4
  },
  {
    sanskrit: "ध्यान",
    transliteration: "Dhyana",
    rootEtymology: "From root 'dhyai' (to contemplate, absorb, attend)",
    category: "Pillar",
    meaning: "Unbroken stream of meditative absorption, stillness of the witness",
    philosophicalContext: "The seventh limb of Raja Yoga, wherein the awareness of the observer, observing, and observed merges into tranquil presence.",
    canonicalReference: "Patanjali Yoga Sutra 3.2: 'Tatra pratyaya-ikatanata dhyanam' (The continuous uninterrupted flow of cognition there is Dhyana).",
    baseFrequency: 392.00 // G4
  },
  {
    sanskrit: "ज्ञान",
    transliteration: "Jnana",
    rootEtymology: "From root 'jñā' (to know directly, realize truth)",
    category: "Pillar",
    meaning: "Direct experiential wisdom, discernment of the changeless Witness",
    philosophicalContext: "Self-inquiry (Atma-Vichara) that distinguishes the permanent Seer (Drik) from transient seen phenomena (Drishya).",
    canonicalReference: "Bhagavad Gita 4.38: 'Na hi jnanena sadrisham pavitram iha vidyate' (Verily, nothing in this world purifies like wisdom).",
    baseFrequency: 440.00 // A4
  },
  {
    sanskrit: "वासना",
    transliteration: "Vasana",
    rootEtymology: "From root 'vas' (to dwell, perfume, impress)",
    category: "Discipline",
    meaning: "Latent subconscious mental impression, conditioned behavioral habit",
    philosophicalContext: "Subconscious memory traces that generate automatic emotional reactivity. Mindful witnessing burns the seeds of limiting Vasanas.",
    canonicalReference: "Yoga Vasistha 2.9: 'Vasanakshaya (dissolution of latent impressions) leads directly to serene liberation.'",
    baseFrequency: 493.88 // B4
  },
  {
    sanskrit: "निष्काम कर्म",
    transliteration: "Nishkama Karma",
    rootEtymology: "'Nis' (without) + 'Kama' (selfish craving) + 'Karma' (action)",
    category: "Discipline",
    meaning: "Action performed purely for cosmic welfare without egoistic motive",
    philosophicalContext: "Acting with complete presence and dedication while remaining unaffected by praise, blame, profit, or loss.",
    canonicalReference: "Bhagavad Gita 3.19: 'Tasmad asaktah satatam karyam karma samacara' (Therefore, without attachment, constantly perform obligatory work).",
    baseFrequency: 523.25 // C5
  }
];

export default function SanskritGlossaryGuide() {
  const [selectedTerm, setSelectedTerm] = useState<SanskritTerm>(CANONICAL_SANSKRIT_TERMS[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioTimeoutRef = useRef<number | null>(null);

  const filteredTerms = CANONICAL_SANSKRIT_TERMS.filter(
    (t) =>
      t.transliteration.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.sanskrit.includes(searchQuery) ||
      t.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Synthesize authentic Vedic acoustic harmonic intonation via Web Audio
  const playVedicHarmonicTone = (freq: number) => {
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }
      
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      setIsPlayingAudio(true);

      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, now);
      masterGain.gain.linearRampToValueAtTime(0.18, now + 0.3);
      masterGain.gain.exponentialRampToValueAtTime(0.001, now + 2.8);
      masterGain.connect(ctx.destination);

      // Fundamental Tanpura tone
      const osc1 = ctx.createOscillator();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(freq, now);
      osc1.connect(masterGain);
      osc1.start(now);
      osc1.stop(now + 3.0);

      // Fifth Harmonic (Pancham resonance)
      const osc2 = ctx.createOscillator();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(freq * 1.5, now);
      const gain2 = ctx.createGain();
      gain2.gain.setValueAtTime(0.08, now);
      osc2.connect(gain2);
      gain2.connect(masterGain);
      osc2.start(now);
      osc2.stop(now + 2.6);

      // Octave shimmer
      const osc3 = ctx.createOscillator();
      osc3.type = "sine";
      osc3.frequency.setValueAtTime(freq * 2, now);
      const gain3 = ctx.createGain();
      gain3.gain.setValueAtTime(0.04, now);
      osc3.connect(gain3);
      gain3.connect(masterGain);
      osc3.start(now);
      osc3.stop(now + 2.2);

      if (audioTimeoutRef.current) clearTimeout(audioTimeoutRef.current);
      audioTimeoutRef.current = window.setTimeout(() => {
        setIsPlayingAudio(false);
      }, 3000);
    } catch {
      setIsPlayingAudio(false);
    }
  };

  useEffect(() => {
    return () => {
      if (audioTimeoutRef.current) clearTimeout(audioTimeoutRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  return (
    <section className="app-surface-card rounded-2xl p-6 border border-(--border-subtle) space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-(--border-subtle) pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl select-none" aria-hidden="true">📜</span>
            <h2 className="text-lg font-bold text-(--foreground)">
              Sanskrit Wisdom & Philosophical Lexicon
            </h2>
          </div>
          <p className="text-xs text-(--muted) mt-0.5">
            Canonical etymology, scriptural context, and Vedic acoustic intonation
          </p>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Filter concepts (e.g., Buddhi, Vasana)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="app-input text-xs px-3 py-1.5 rounded-xl border border-(--border-subtle) bg-(--surface) max-w-xs"
        />
      </div>

      {/* Grid: Concept List + Detail Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Left Column: List of Terms */}
        <div className="md:col-span-5 space-y-2 max-h-96 overflow-y-auto pr-1">
          {filteredTerms.map((term) => {
            const isSelected = selectedTerm.transliteration === term.transliteration;
            return (
              <button
                key={term.transliteration}
                onClick={() => setSelectedTerm(term)}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                  isSelected
                    ? "bg-(--primary) text-(--on-primary) border-(--primary) shadow-sm"
                    : "bg-(--surface) text-(--foreground) border-(--border-subtle) hover:bg-(--surface-soft)"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-base">{term.sanskrit}</span>
                    <span className="text-xs font-bold font-sans">({term.transliteration})</span>
                  </div>
                  <div className={`text-[11px] truncate max-w-[200px] ${isSelected ? "text-emerald-100" : "text-(--muted)"}`}>
                    {term.meaning}
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                  isSelected ? "bg-white/20 text-white" : "bg-(--surface-soft) text-(--muted)"
                }`}>
                  {term.category}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Column: In-Depth Breakdown */}
        <div className="md:col-span-7 bg-(--surface-soft) rounded-xl p-5 border border-(--border-subtle) space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-(--border-subtle) pb-3">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-serif text-(--primary) font-semibold">
                  {selectedTerm.sanskrit}
                </span>
                <span className="text-base font-bold text-(--foreground)">
                  {selectedTerm.transliteration}
                </span>
              </div>
              <p className="text-xs text-(--muted) italic mt-0.5">
                {selectedTerm.rootEtymology}
              </p>
            </div>

            {/* Audio Intonation Button */}
            <button
              onClick={() => playVedicHarmonicTone(selectedTerm.baseFrequency)}
              disabled={isPlayingAudio}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                isPlayingAudio
                  ? "bg-amber-600 text-white animate-pulse"
                  : "bg-(--primary) text-(--on-primary) hover:opacity-90"
              }`}
            >
              <span>{isPlayingAudio ? "Resonating..." : "Play Vedic Intonation"}</span>
              <span aria-hidden="true">🔔</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-(--muted)">Core Meaning</div>
              <p className="text-(--foreground) font-medium mt-0.5">{selectedTerm.meaning}</p>
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-(--muted)">Philosophical Context</div>
              <p className="text-(--foreground) leading-relaxed mt-0.5">{selectedTerm.philosophicalContext}</p>
            </div>

            <div className="bg-(--surface) p-3 rounded-lg border border-(--border-subtle)">
              <div className="text-[10px] font-bold uppercase tracking-wider text-(--primary)">Canonical Scriptural Citation</div>
              <p className="text-(--foreground) italic mt-0.5 font-serif">{selectedTerm.canonicalReference}</p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
