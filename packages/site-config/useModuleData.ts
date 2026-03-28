/**
 * Generic, reusable hook for CRUD operations on any module
 * Supports loading, error handling, and retries
 */

import { useCallback, useEffect, useState } from 'react';
import { apiFetch, APIClientError } from '@buddhi-align/site-config';

export interface UseModuleDataOptions {
  autoLoad?: boolean;
  timeout?: number;
}

export interface UseModuleDataState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Generic hook for managing module data with automatic retry and error handling
 * 
 * @example
 * const { data: entries, loading, error } = useModuleData<JournalEntry>('bhakti');
 */
export function useModuleData<T extends { id?: string }>(
  moduleName: string,
  options: UseModuleDataOptions = {},
): UseModuleDataState<T> & {
  addEntry: (entry: Omit<T, 'id'>) => Promise<void>;
  updateEntry: (id: string, updates: Partial<T>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  isCreating: boolean;
  deletingIds: string[];
} {
  const { autoLoad = true, timeout } = options;
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const entries = await apiFetch<T[]>(`/api/${moduleName}`, { timeout });
      setData(Array.isArray(entries) ? entries : []);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load data';
      setError(message);
      setData([]);
      console.error(`[useModuleData] Error loading ${moduleName}:`, err);
    } finally {
      setLoading(false);
    }
  }, [moduleName, timeout]);

  useEffect(() => {
    if (autoLoad) {
      refetch();
    }
  }, [autoLoad, refetch]);

  const addEntry = useCallback(
    async (entry: Omit<T, 'id'>) => {
      if (!entry || typeof entry !== 'object') {
        throw new Error('Invalid entry data');
      }

      setIsCreating(true);

      try {
        const newEntry = await apiFetch<T>(`/api/${moduleName}`, {
          method: 'POST',
          body: JSON.stringify(entry),
          timeout,
        });
        setData((prev) => [...prev, newEntry]);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add entry';
        setError(message);
        console.error(`[useModuleData] Error adding entry to ${moduleName}:`, err);
        throw err;
      } finally {
        setIsCreating(false);
      }
    },
    [moduleName, timeout],
  );

  const updateEntry = useCallback(
    async (id: string, updates: Partial<T>) => {
      if (!id) {
        throw new Error('Entry ID is required');
      }

      try {
        const updated = await apiFetch<T>(`/api/${moduleName}/${id}`, {
          method: 'PUT',
          body: JSON.stringify(updates),
          timeout,
        });
        setData((prev) => prev.map((item) => (item.id === id ? updated : item)));
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update entry';
        setError(message);
        console.error(`[useModuleData] Error updating entry ${id} in ${moduleName}:`, err);
        throw err;
      }
    },
    [moduleName, timeout],
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      if (!id) {
        throw new Error('Entry ID is required');
      }

      setDeletingIds((prev) => [...prev, id]);

      try {
        await apiFetch(`/api/${moduleName}/${id}`, {
          method: 'DELETE',
          timeout,
        });
        setData((prev) => prev.filter((item) => item.id !== id));
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete entry';
        setError(message);
        console.error(`[useModuleData] Error deleting entry ${id} from ${moduleName}:`, err);
        throw err;
      } finally {
        setDeletingIds((prev) => prev.filter((entryId) => entryId !== id));
      }
    },
    [moduleName, timeout],
  );

  return {
    data,
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
