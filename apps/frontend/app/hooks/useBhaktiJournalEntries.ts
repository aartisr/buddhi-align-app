import { useModuleData } from "@buddhi-align/site-config/client";

export interface BhaktiJournalEntry {
  id?: string;
  date: string;
  reflection: string;
  gratitude: string;
}

/**
 * Hook for managing Bhakti Journal entries with automatic error handling and retries
 * Uses the generic useModuleData hook for resilience
 */
export function useBhaktiJournalEntries() {
  const { data, loading, error, refetch, addEntry, updateEntry, deleteEntry, isCreating, deletingIds } =
    useModuleData<BhaktiJournalEntry>("bhakti");

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
