import { useModuleData } from "@buddhi-align/site-config/client";

export interface DhyanaMeditationEntry {
  id?: string;
  date: string;
  type: string;
  duration: number;
  notes: string;
}

/**
 * Hook for managing Dhyana Meditation entries with automatic error handling and retries
 */
export function useDhyanaMeditationEntries() {
  const { data, loading, error, refetch, addEntry, updateEntry, deleteEntry, isCreating, deletingIds } =
    useModuleData<DhyanaMeditationEntry>("dhyana");

  return {
    entries: data,
    loading,
    error,
    refetch,
    addEntry,
    updateEntry,
    deleteEntry,
    isCreating,
    deletingIds,
  };
}
