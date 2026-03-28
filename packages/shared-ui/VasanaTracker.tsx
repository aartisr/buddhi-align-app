import React from "react";
import { ModuleRecordCollection } from "./ModuleRecordCollection";

export interface VasanaTrackerEntry {
  id?: string;
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
  onDelete?: (id: string) => void | Promise<void>;
  deletingIds?: string[];
  deleteLabel?: string;
}

export const VasanaTracker: React.FC<VasanaTrackerProps> = ({
  title,
  description,
  emptyState,
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
      title: entry.habit,
      details: [entry.tendency],
      note: entry.notes,
      accentClassName: "app-record-accent--vasana",
    }))}
    onDelete={onDelete}
    deletingIds={deletingIds}
    deleteLabel={deleteLabel}
  />
);
