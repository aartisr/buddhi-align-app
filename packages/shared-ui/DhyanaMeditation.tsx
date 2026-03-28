import React from "react";
import { ModuleRecordCollection } from "./ModuleRecordCollection";

export interface DhyanaMeditationEntry {
  id?: string;
  date: string;
  type: string;
  duration: number; // in minutes
  notes: string;
}

export interface DhyanaMeditationProps {
  title: string;
  description: string;
  emptyState: string;
  durationUnit: string;
  entries: DhyanaMeditationEntry[];
  onAddEntry?: (entry: DhyanaMeditationEntry) => void;
  onDelete?: (id: string) => void | Promise<void>;
  deletingIds?: string[];
  deleteLabel?: string;
}

export const DhyanaMeditation: React.FC<DhyanaMeditationProps> = ({
  title,
  description,
  emptyState,
  durationUnit,
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
      title: entry.type,
      details: [`${entry.duration} ${durationUnit}`],
      note: entry.notes,
      accentClassName: "app-record-accent--dhyana",
    }))}
    onDelete={onDelete}
    deletingIds={deletingIds}
    deleteLabel={deleteLabel}
  />
);
