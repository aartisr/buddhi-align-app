import React from "react";
import { ModuleRecordCollection } from "./ModuleRecordCollection";

export interface BhaktiJournalEntry {
  id?: string;
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
  onDelete?: (id: string) => void | Promise<void>;
  deletingIds?: string[];
  deleteLabel?: string;
}

export const BhaktiJournal: React.FC<BhaktiJournalProps> = ({
  title,
  description,
  emptyState,
  gratitudeLabel,
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
      title: entry.reflection,
      details: [`${gratitudeLabel}: ${entry.gratitude}`],
      accentClassName: "app-record-accent--bhakti",
    }))}
    onDelete={onDelete}
    deletingIds={deletingIds}
    deleteLabel={deleteLabel}
  />
);
