import React from "react";
import { ModuleRecordCollection } from "./ModuleRecordCollection";

export interface KarmaYogaTrackerProps {
  title: string;
  description: string;
  emptyState: string;
  entries: Array<{
    id?: string;
    date: string;
    action: string;
    impact: string;
  }>;
  onAddEntry?: (entry: { date: string; action: string; impact: string }) => void;
  onDelete?: (id: string) => void | Promise<void>;
  deletingIds?: string[];
  deleteLabel?: string;
}

export const KarmaYogaTracker: React.FC<KarmaYogaTrackerProps> = ({
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
      title: entry.action,
      details: [entry.impact],
      accentClassName: "app-record-accent--karma",
    }))}
    onDelete={onDelete}
    deletingIds={deletingIds}
    deleteLabel={deleteLabel}
  />
);
