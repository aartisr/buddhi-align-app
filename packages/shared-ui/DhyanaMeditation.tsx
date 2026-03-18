import React from "react";

export interface DhyanaMeditationEntry {
  date: string;
  type: string;
  duration: number; // in minutes
  notes: string;
}

export interface DhyanaMeditationProps {
  entries: DhyanaMeditationEntry[];
  onAddEntry?: (entry: DhyanaMeditationEntry) => void;
}

export const DhyanaMeditation: React.FC<DhyanaMeditationProps> = ({ entries, onAddEntry }) => (
  <section className="mb-12">
    <h2 className="text-2xl font-semibold mb-2 text-green-700">Dhyana Meditation</h2>
    <p className="text-zinc-600 mb-4">Guided and self-led meditation tools.</p>
    <div className="space-y-4">
      {entries.length === 0 ? (
        <p className="text-zinc-400">No meditation sessions yet. Start by adding your first session.</p>
      ) : (
        <ul className="divide-y divide-zinc-100">
          {entries.map((entry, i) => (
            <li key={i} className="py-2 flex flex-col md:flex-row md:items-center md:gap-4">
              <span className="font-medium text-green-700 w-24">{entry.date}</span>
              <span className="flex-1">{entry.type}</span>
              <span className="text-zinc-700">{entry.duration} min</span>
              <span className="text-zinc-500 text-sm">{entry.notes}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
    {/* Removed extra Add Session button to avoid duplication with page form */}
  </section>
);
