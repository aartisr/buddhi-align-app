"use client";

import React, { useState } from "react";

export default function PrintableSadhanaReview() {
  const [selectedMonth, setSelectedMonth] = useState("September 2026");
  const [practitionerName, setPractitionerName] = useState("Sadhaka");
  const [focusIntention, setFocusIntention] = useState("Equanimity in daily action and unbroken morning witness awareness.");

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-(--surface-soft) rounded-2xl p-6 border border-(--border-subtle) space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-(--border-subtle) pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl select-none" aria-hidden="true">🖨️</span>
            <h2 className="text-lg font-bold text-(--foreground)">
              Printable Sadhana Journal & Monthly Review Worksheet
            </h2>
          </div>
          <p className="text-xs text-(--muted) mt-0.5">
            Offline contemplative tracking for physical journal integration and digital detox periods
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-(--primary) text-(--on-primary) hover:opacity-90 flex items-center gap-2 shadow-sm"
        >
          <span>Print Sadhana Sheet (PDF)</span>
          <span aria-hidden="true">📄</span>
        </button>
      </div>

      {/* Configuration row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-(--muted) block mb-1">
            Month / Practice Cycle
          </label>
          <input
            type="text"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full text-xs p-2 rounded-xl border border-(--border-subtle) bg-(--surface)"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-(--muted) block mb-1">
            Practitioner Name / Alias
          </label>
          <input
            type="text"
            value={practitionerName}
            onChange={(e) => setPractitionerName(e.target.value)}
            className="w-full text-xs p-2 rounded-xl border border-(--border-subtle) bg-(--surface)"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-(--muted) block mb-1">
            Core Sankalpa (Intention)
          </label>
          <input
            type="text"
            value={focusIntention}
            onChange={(e) => setFocusIntention(e.target.value)}
            className="w-full text-xs p-2 rounded-xl border border-(--border-subtle) bg-(--surface)"
          />
        </div>
      </div>

      {/* Printable Sheet Preview */}
      <div className="bg-white text-slate-900 p-8 rounded-xl border border-slate-300 shadow-inner print:m-0 print:p-0 print:border-none">
        
        {/* Header */}
        <div className="border-b-2 border-emerald-900 pb-4 mb-6 flex items-baseline justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-emerald-950">
              बुद्धि अलायन • Buddhi Align Sadhana Sheet
            </h1>
            <p className="text-xs text-slate-600 italic">
              Monthly Contemplation & 6-Pillar Vedic Alignment Record
            </p>
          </div>
          <div className="text-right text-xs">
            <div className="font-bold text-emerald-900">{selectedMonth}</div>
            <div className="text-slate-600">Practitioner: {practitionerName}</div>
          </div>
        </div>

        {/* Sankalpa Banner */}
        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg mb-6 text-xs">
          <span className="font-bold text-emerald-950 uppercase tracking-wider text-[10px]">Monthly Sankalpa: </span>
          <span className="italic text-emerald-900">{focusIntention}</span>
        </div>

        {/* 6 Pillars Tracking Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {[
            { name: "1. Dharma Planner", desc: "Values & Ethical Action", items: ["Weekly Duty Audit", "Integrity Check", "Right Livelihood"] },
            { name: "2. Karma Yoga", desc: "Nishkama Seva & Offering", items: ["Selfless Service Hour", "Outcome Detachment", "Work Consecration"] },
            { name: "3. Bhakti Journal", desc: "Gratitude & Devotion", items: ["Morning Prayer/Japa", "Evening Gratitude (3)", "Surrender (Sharanagati)"] },
            { name: "4. Dhyana Meditation", desc: "Stillness & Absorption", items: ["Brahmamuhurta Sit", "Tanpura Breathing", "Witness Awareness"] },
            { name: "5. Jnana Reflection", desc: "Scripture & Self-Inquiry", items: ["Gita/Upanishad Verse", "Who Am I? Contemplation", "Discernment of Seer"] },
            { name: "6. Vasana Tracker", desc: "Subconscious Impressions", items: ["Trigger Observation", "Mindful Pause", "Habit Transmutation"] },
          ].map((pillar) => (
            <div key={pillar.name} className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              <h3 className="font-bold text-xs text-emerald-950 font-serif">{pillar.name}</h3>
              <p className="text-[10px] text-slate-500 mb-2">{pillar.desc}</p>
              <div className="space-y-1.5 text-[11px]">
                {pillar.items.map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border border-slate-400 rounded-sm bg-white" />
                    <span className="text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 31-Day Micro Habit Matrix */}
        <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 mb-6">
          <h3 className="font-bold text-xs text-emerald-950 mb-2 font-serif">Daily Rhythm Check (Days 1 - 31)</h3>
          <div className="grid grid-cols-8 sm:grid-cols-16 gap-1 text-[10px] text-center">
            {Array.from({ length: 31 }, (_, i) => (
              <div key={i} className="border border-slate-300 rounded p-1 bg-white">
                <div className="font-bold text-slate-500">{i + 1}</div>
                <div className="w-3 h-3 mx-auto mt-1 border border-slate-400 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Notes & Insights Section */}
        <div className="border-t border-slate-200 pt-4">
          <div className="text-xs font-bold text-slate-800 mb-2">Monthly Insights & Chitta Shuddhi Observations:</div>
          <div className="space-y-2">
            <div className="border-b border-dashed border-slate-300 h-6" />
            <div className="border-b border-dashed border-slate-300 h-6" />
            <div className="border-b border-dashed border-slate-300 h-6" />
          </div>
        </div>

      </div>
    </div>
  );
}
