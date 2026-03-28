import React from "react";

export interface KarmaYogaTrackerProps {
  title: string;
  description: string;
  emptyState: string;
  entries: Array<{
    date: string;
    action: string;
    impact: string;
  }>;
  onAddEntry?: (entry: { date: string; action: string; impact: string }) => void;
}

export const KarmaYogaTracker: React.FC<KarmaYogaTrackerProps> = ({
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
              <span className="flex-1">{entry.action}</span>
              <span className="app-record-accent--karma font-semibold">{entry.impact}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  </section>
);
