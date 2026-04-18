import { useModuleData } from "@buddhi-align/site-config/client";

export interface VasanaTrackerEntry {
  id?: string;
  date: string;
  habit: string;
  tendency: string;
  notes: string;
}

/**
 * Hook for managing Vasana Tracker entries with automatic error handling and retries
 */
export function useVasanaTrackerEntries() {
  const { data, loading, error, refetch, addEntry, updateEntry, deleteEntry, isCreating, deletingIds } =
    useModuleData<VasanaTrackerEntry>("vasana");

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
