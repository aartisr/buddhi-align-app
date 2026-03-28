import React from "react";
import { ModuleRecordCollection } from "./ModuleRecordCollection";

export interface DharmaPlannerEntry {
  id?: string;
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
  onDelete?: (id: string) => void | Promise<void>;
  deletingIds?: string[];
  deleteLabel?: string;
}

export const DharmaPlanner: React.FC<DharmaPlannerProps> = ({
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
      title: entry.goal,
      details: [entry.action, entry.status],
      accentClassName: "app-record-accent--dharma",
    }))}
    onDelete={onDelete}
    deletingIds={deletingIds}
    deleteLabel={deleteLabel}
  />
);
