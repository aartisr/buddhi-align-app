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
    <h2 className="text-2xl font-semibold mb-2 text-blue-700">{title}</h2>
    <p className="text-zinc-600 mb-4">{description}</p>
    <div className="space-y-4">
      {entries.length === 0 ? (
        <p className="text-zinc-400">{emptyState}</p>
      ) : (
        <ul className="divide-y divide-zinc-100">
          {entries.map((entry, i) => (
            <li key={i} className="py-2">
              <span className="font-medium text-blue-700 w-24">{entry.date}</span>
              <div className="ml-2">
                <div className="text-zinc-700">{entry.insight}</div>
                <div className="text-indigo-700 text-sm">{contemplationLabel}: {entry.contemplation}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
    {/* Removed extra Add Entry button to avoid duplication with page form */}
  </section>
);
