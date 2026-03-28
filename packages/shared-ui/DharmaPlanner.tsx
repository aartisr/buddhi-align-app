import React from "react";

export interface DharmaPlannerEntry {
  date: string;
  goal: string;
  action: string;
  status: string;
}

export interface DharmaPlannerProps {
  title: string;
  description: string;
  emptyState: string;
  entries: DharmaPlannerEntry[];
  onAddEntry?: (entry: DharmaPlannerEntry) => void;
}

export const DharmaPlanner: React.FC<DharmaPlannerProps> = ({
  title,
  description,
  emptyState,
  entries,
  onAddEntry,
}) => (
  <section className="mb-12">
    <h2 className="text-2xl font-semibold mb-2 text-purple-700">{title}</h2>
    <p className="text-zinc-600 mb-4">{description}</p>
    <div className="space-y-4">
      {entries.length === 0 ? (
        <p className="text-zinc-400">{emptyState}</p>
      ) : (
        <ul className="divide-y divide-zinc-100">
          {entries.map((entry, i) => (
            <li key={i} className="py-2 flex flex-col md:flex-row md:items-center md:gap-4">
              <span className="font-medium text-purple-700 w-24">{entry.date}</span>
              <span className="flex-1">{entry.goal}</span>
              <span className="text-zinc-700">{entry.action}</span>
              <span className="text-zinc-500 text-sm">{entry.status}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
    {/* Removed extra Add Plan button to avoid duplication with page form */}
  </section>
);
