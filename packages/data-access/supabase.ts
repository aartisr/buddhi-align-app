/**
 * SupabaseDataProvider
 *
 * Persists data in a Supabase PostgreSQL database using a single generic
 * `module_entries` table.  All module-specific fields are stored in a
 * JSONB `data` column so no schema changes are needed when a module's
 * fields evolve.
 *
 * Required environment variables (server-side only — never expose to clients):
 *   SUPABASE_URL              — Project URL from Supabase Settings → API
 *   SUPABASE_SERVICE_ROLE_KEY — Service-role secret (full DB access, bypasses RLS)
 *
 * Activate: DATA_PROVIDER=supabase  (the default)
 *
 * See /supabase/schema.sql for the table definition and indexes.
 */

import { createClient } from '@supabase/supabase-js';
import type { DataAccessContext, DataProvider, ModuleEntry } from './provider';

export function createSupabaseDataProvider(): DataProvider {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'SupabaseDataProvider requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY ' +
        'environment variables to be set.',
    );
  }

  // Server-side client — session persistence is not needed.
  const client = createClient(url, key, {
    auth: { persistSession: false },
  });

  function applyUserScope<T>(query: T, context?: DataAccessContext): T {
    if (!context?.userId) return query;
    return (query as { eq: (column: string, value: string) => T }).eq('user_id', context.userId);
  }

  return {
    async list<T extends ModuleEntry>(module: string, context?: DataAccessContext): Promise<T[]> {
      const scopedQuery = applyUserScope(
        client
        .from('module_entries')
        .select('id, data')
        .eq('module', module)
        .order('created_at', { ascending: true }),
        context,
      );

      const { data, error } = await scopedQuery;

      if (error) throw new Error(`Supabase list error: ${error.message}`);
      return (data ?? []).map(
        (row) => ({ id: row.id, ...(row.data as object) }) as T,
      );
    },

    async create<T extends ModuleEntry>(
      module: string,
      entryData: Omit<T, 'id'>,
      context?: DataAccessContext,
    ): Promise<T> {
      const { data, error } = await client
        .from('module_entries')
        .insert({
          module,
          data: entryData,
          user_id: context?.userId,
        })
        .select('id, data')
        .single();

      if (error) throw new Error(`Supabase create error: ${error.message}`);
      return { id: data.id, ...(data.data as object) } as T;
    },

    async update<T extends ModuleEntry>(
      module: string,
      id: string,
      entryData: Partial<Omit<T, 'id'>>,
      context?: DataAccessContext,
    ): Promise<T> {
      // Fetch current payload, merge, then write back atomically.
      const fetchQuery = applyUserScope(
        client
        .from('module_entries')
        .select('data')
        .eq('id', id)
        .eq('module', module),
        context,
      );
      const { data: current, error: fetchErr } = await fetchQuery.single();

      if (fetchErr) {
        throw new Error(
          `Supabase update (fetch) error: ${fetchErr.message}`,
        );
      }

      const merged = { ...(current.data as object), ...entryData };

      const updateQuery = applyUserScope(
        client
        .from('module_entries')
        .update({ data: merged })
        .eq('id', id)
        .eq('module', module),
        context,
      );
      const { data, error } = await updateQuery.select('id, data').single();

      if (error) throw new Error(`Supabase update error: ${error.message}`);
      return { id: data.id, ...(data.data as object) } as T;
    },

    async delete(module: string, id: string, context?: DataAccessContext): Promise<void> {
      const deleteQuery = applyUserScope(
        client
        .from('module_entries')
        .delete()
        .eq('id', id)
        .eq('module', module),
        context,
      );
      const { error } = await deleteQuery;

      if (error) throw new Error(`Supabase delete error: ${error.message}`);
    },
  };
}
