import React from "react";
import { ModuleRecordCollection } from "./ModuleRecordCollection";

export interface JnanaReflectionEntry {
  id?: string;
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
  onDelete?: (id: string) => void | Promise<void>;
  deletingIds?: string[];
  deleteLabel?: string;
}

export const JnanaReflection: React.FC<JnanaReflectionProps> = ({
  title,
  description,
  emptyState,
  contemplationLabel,
  entries,
  onDelete,
  deletingIds,
  deleteLabel,
}) => (
  <ModuleRecordCollection
    title={title}
    description={description}
    emptyState={emptyState}
    entries={entries.map((entry) => ({
      id: entry.id,
      date: entry.date,
      title: entry.insight,
      details: [`${contemplationLabel}: ${entry.contemplation}`],
      accentClassName: "app-record-accent--jnana",
    }))}
    onDelete={onDelete}
    deletingIds={deletingIds}
    deleteLabel={deleteLabel}
  />
);
