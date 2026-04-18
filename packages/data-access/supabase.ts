/**
 * SupabaseDataProvider
 *
 * Persists data in a Supabase PostgreSQL database using a single generic
 * `module_entries` table.  All module-specific fields are stored in a
 * JSONB `data` column so no schema changes are needed when a module's
 * fields evolve.
 *
 * User ownership is tracked exclusively via the `__ownerId` field inside
 * the JSONB `data` column.  The optional `user_id` column (added by
 * schema_user_scoped.sql) is intentionally NOT used for writes because the
 * app uses NextAuth, whose user IDs are NOT registered in Supabase's
 * `auth.users` table — writing to that column would violate the FK
 * constraint "module_entries_user_id_fkey".
 *
 * Required environment variables (server-side only — never expose to clients):
 *   SUPABASE_URL              — Project URL from Supabase Settings → API
 *   SUPABASE_SERVICE_ROLE_KEY — Service-role secret (full DB access, bypasses RLS)
 *
 * Activate: DATA_PROVIDER=supabase  (the default)
 *
 * See /supabase/schema.sql for the table definition and indexes.
 * Run /supabase/schema_fix_user_id_fk.sql to drop the FK constraint if you
 * previously applied schema_user_scoped.sql.
 */

import { createClient } from '@supabase/supabase-js';
import type { DataAccessContext, DataProvider, ModuleEntry } from './provider';

const OWNER_ID_KEY = '__ownerId';
const DEFAULT_SUPABASE_FETCH_TIMEOUT_MS = 2500;

type ModuleRow = {
  id: string;
  data: Record<string, unknown>;
};

function withOwnerId(data: Record<string, unknown>, context?: DataAccessContext): Record<string, unknown> {
  if (!context?.userId) return data;
  return {
    ...data,
    [OWNER_ID_KEY]: context.userId,
  };
}

function extractOwnerId(data: Record<string, unknown>): string | undefined {
  const ownerId = data[OWNER_ID_KEY];
  return typeof ownerId === 'string' ? ownerId : undefined;
}

function stripInternalFields<T extends ModuleEntry>(row: ModuleRow): T {
  const { [OWNER_ID_KEY]: _ignored, ...publicData } = row.data;
  return {
    id: row.id,
    ...(publicData as object),
  } as T;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const json = Buffer.from(parts[1], 'base64url').toString('utf8');
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_SUPABASE_FETCH_TIMEOUT_MS);

  try {
    return await fetch(input, {
      ...init,
      signal: init?.signal ?? controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export function createSupabaseDataProvider(): DataProvider {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'SupabaseDataProvider requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY ' +
        'environment variables to be set.',
    );
  }

  const jwtPayload = decodeJwtPayload(key);
  if (jwtPayload?.role !== 'service_role') {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not a service-role key. ' +
        'Use the service_role secret from Supabase Project Settings -> API.',
    );
  }

  // Server-side client — session persistence is not needed.
  const client = createClient(url, key, {
    auth: { persistSession: false },
    global: {
      fetch: fetchWithTimeout,
    },
  });

  return {
    async list<T extends ModuleEntry>(module: string, context?: DataAccessContext): Promise<T[]> {
      const { data, error } = await client
        .from('module_entries')
        .select('id, data')
        .eq('module', module)
        .order('created_at', { ascending: true });

      if (error) throw new Error(`Supabase list error: ${error.message}`);

      const rows = (data ?? []) as ModuleRow[];
      if (!context?.userId) {
        return rows.map((row) => stripInternalFields<T>(row));
      }

      // Ownership scoped entirely via __ownerId in the JSONB data column.
      // The optional user_id column (schema_user_scoped.sql) is NOT used here
      // because it has a FK constraint to auth.users which is incompatible with
      // NextAuth user IDs. Run schema_fix_user_id_fk.sql to remove that FK.
      return rows
        .filter((row) => extractOwnerId(row.data) === context.userId)
        .map((row) => stripInternalFields<T>(row));
    },

    async create<T extends ModuleEntry>(
      module: string,
      entryData: Omit<T, 'id'>,
      context?: DataAccessContext,
    ): Promise<T> {
      const payload = withOwnerId(entryData as Record<string, unknown>, context);

      // Never write to the user_id column — its FK to auth.users conflicts with
      // NextAuth session IDs. All user-scoping uses __ownerId inside the data JSONB.
      const { data, error } = await client
        .from('module_entries')
        .insert({ module, data: payload })
        .select('id, data')
        .single();

      if (error) throw new Error(`Supabase create error: ${error.message}`);
      return stripInternalFields<T>(data as ModuleRow);
    },

    async update<T extends ModuleEntry>(
      module: string,
      id: string,
      entryData: Partial<Omit<T, 'id'>>,
      context?: DataAccessContext,
    ): Promise<T> {
      const { data: current, error: fetchErr } = await client
        .from('module_entries')
        .select('id, data')
        .eq('id', id)
        .eq('module', module)
        .single();

      if (fetchErr) {
        throw new Error(`Supabase update (fetch) error: ${fetchErr.message}`);
      }

      const currentRow = current as ModuleRow;
      if (context?.userId && extractOwnerId(currentRow.data) !== context.userId) {
        throw new Error('Not found');
      }

      const merged = withOwnerId(
        { ...currentRow.data, ...(entryData as object) } as Record<string, unknown>,
        context,
      );

      const { data, error } = await client
        .from('module_entries')
        .update({ data: merged })
        .eq('id', id)
        .eq('module', module)
        .select('id, data')
        .single();

      if (error) throw new Error(`Supabase update error: ${error.message}`);
      return stripInternalFields<T>(data as ModuleRow);
    },

    async delete(module: string, id: string, context?: DataAccessContext): Promise<void> {
      if (context?.userId) {
        const { data: current, error: fetchErr } = await client
          .from('module_entries')
          .select('id, data')
          .eq('id', id)
          .eq('module', module)
          .maybeSingle();

        if (fetchErr) {
          throw new Error(`Supabase delete (fetch) error: ${fetchErr.message}`);
        }
        if (!current) throw new Error('Not found');
        const currentRow = current as ModuleRow;
        if (extractOwnerId(currentRow.data) !== context.userId) {
          throw new Error('Not found');
        }
      }

      const { error } = await client
        .from('module_entries')
        .delete()
        .eq('id', id)
        .eq('module', module);

      if (error) throw new Error(`Supabase delete error: ${error.message}`);
    },
  };
}
