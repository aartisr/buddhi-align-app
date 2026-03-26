import { useModuleData } from "@buddhi-align/site-config";

export interface DharmaPlannerEntry {
  id?: string;
  date: string;
  goal: string;
  action: string;
  status: string;
}

/**
 * Hook for managing Dharma Planner entries with automatic error handling and retries
 */
export function useDharmaPlannerEntries() {
  const { data, loading, error, refetch, addEntry, updateEntry, deleteEntry } =
    useModuleData<DharmaPlannerEntry>("dharma");

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
