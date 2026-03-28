import React from "react";

export interface VasanaTrackerEntry {
  date: string;
  habit: string;
  tendency: string;
  notes: string;
}

export interface VasanaTrackerProps {
  title: string;
  description: string;
  emptyState: string;
  entries: VasanaTrackerEntry[];
  onAddEntry?: (entry: VasanaTrackerEntry) => void;
}

export const VasanaTracker: React.FC<VasanaTrackerProps> = ({
  title,
  description,
  emptyState,
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
            <li key={i} className="py-2 flex flex-col md:flex-row md:items-center md:gap-4">
              <span className="app-record-date font-medium w-24">{entry.date}</span>
              <span className="flex-1">{entry.habit}</span>
              <span className="text-zinc-700">{entry.tendency}</span>
              <span className="app-record-note text-sm">{entry.notes}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  </section>
);
