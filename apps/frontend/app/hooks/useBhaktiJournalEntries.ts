import { useModuleData } from "@buddhi-align/site-config";

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
  const { data, loading, error, refetch, addEntry, updateEntry, deleteEntry } =
    useModuleData<BhaktiJournalEntry>("bhakti");

  return {
    entries: data,
    loading,
    error,
    refetch,
    addEntry,
    updateEntry,
    deleteEntry,
  };
}
