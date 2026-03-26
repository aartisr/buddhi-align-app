import { useModuleData } from "@buddhi-align/site-config";

export interface JnanaReflectionEntry {
  id?: string;
  date: string;
  insight: string;
  contemplation: string;
}

/**
 * Hook for managing Jnana Reflection entries with automatic error handling and retries
 */
export function useJnanaReflectionEntries() {
  const { data, loading, error, refetch, addEntry, updateEntry, deleteEntry } =
    useModuleData<JnanaReflectionEntry>("jnana");

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
