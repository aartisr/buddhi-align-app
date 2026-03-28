import React from "react";

export interface JnanaReflectionEntry {
  date: string;
  insight: string;
  contemplation: string;
}

export interface JnanaReflectionProps {
  title: string;
  description: string;
  emptyState: string;
  contemplationLabel: string;
  entries: JnanaReflectionEntry[];
  onAddEntry?: (entry: JnanaReflectionEntry) => void;
}

export const JnanaReflection: React.FC<JnanaReflectionProps> = ({
  title,
  description,
  emptyState,
  contemplationLabel,
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
                <div className="text-zinc-700">{entry.insight}</div>
                <div className="app-record-accent--jnana text-sm">{contemplationLabel}: {entry.contemplation}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  </section>
);
