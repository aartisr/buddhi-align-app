import React from "react";

export interface BhaktiJournalEntry {
  date: string;
  reflection: string;
  gratitude: string;
}

export interface BhaktiJournalProps {
  title: string;
  description: string;
  emptyState: string;
  gratitudeLabel: string;
  entries: BhaktiJournalEntry[];
  onAddEntry?: (entry: BhaktiJournalEntry) => void;
}

export const BhaktiJournal: React.FC<BhaktiJournalProps> = ({
  title,
  description,
  emptyState,
  gratitudeLabel,
  entries,
  onAddEntry,
}) => (
  <section className="mb-12">
    <h2 className="app-section-heading text-2xl font-semibold mb-2">{title}</h2>
    <p className="app-copy mb-4">{description}</p>
    <div className="space-y-4">
      {entries.length === 0 ? (
        <p className="app-empty-state">{emptyState}</p>
      ) : (
        <ul className="divide-y divide-zinc-100">
          {entries.map((entry, i) => (
            <li key={i} className="py-2">
              <span className="app-record-date font-medium w-24">{entry.date}</span>
              <div className="ml-2">
                <div className="text-zinc-700">{entry.reflection}</div>
                <div className="app-record-accent--bhakti text-sm">{gratitudeLabel}: {entry.gratitude}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  </section>
);
