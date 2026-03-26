import { useModuleData } from "@buddhi-align/site-config";

export interface KarmaYogaEntry {
  id?: string;
  date: string;
  action: string;
  impact: string;
}

/**
 * Hook for managing Karma Yoga entries with automatic error handling and retries
 */
export function useKarmaYogaEntries() {
  const { data, loading, error, refetch, addEntry, updateEntry, deleteEntry } =
    useModuleData<KarmaYogaEntry>("karma");

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
