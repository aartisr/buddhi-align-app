import { useModuleData } from "@buddhi-align/site-config/client";

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
  const { data, loading, error, refetch, addEntry, updateEntry, deleteEntry, isCreating, deletingIds } =
    useModuleData<JnanaReflectionEntry>("jnana");

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
