/**
 * SupabaseDataProvider
 *
 * Persists data in a Supabase PostgreSQL database using a single generic
 * `module_entries` table.  All module-specific fields are stored in a
 * JSONB `data` column so no schema changes are needed when a module's
 * fields evolve.
 *
 * User ownership is tracked exclusively via the `__ownerId` field inside
 * the JSONB `data` column. Any legacy `user_id` column is intentionally
 * NOT used for writes because the
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
 */

import { createClient } from '@supabase/supabase-js';
import type { DataAccessContext, DataProvider, ModuleEntry } from './provider';

const OWNER_ID_KEY = '__ownerId';
const DEFAULT_SUPABASE_FETCH_TIMEOUT_MS = 2500;
const DEFAULT_TENANT_ID = 'default';
const DEFAULT_SOURCE = 'app';

type ModuleRow = {
  id: string;
  data: Record<string, unknown>;
};

type RpcModuleRow = {
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

function normalizeTenantId(context?: DataAccessContext): string {
  return context?.tenantId?.trim() ? context.tenantId.trim() : DEFAULT_TENANT_ID;
}

function normalizeSource(context?: DataAccessContext): string {
  return context?.source?.trim() ? context.source.trim() : DEFAULT_SOURCE;
}

function isMissingRpcFunctionError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes('could not find the function') ||
    (m.includes('function') && m.includes('does not exist'))
  );
}

function isMissingColumnError(message: string): boolean {
  return message.toLowerCase().includes('column') && message.toLowerCase().includes('does not exist');
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
      let rows: ModuleRow[];

      // Prefer active-row filtering for schemas with soft-delete support.
      const activeResult = await client
        .from('module_entries')
        .select('id, data')
        .eq('module', module)
        .is('deleted_at', null)
        .order('created_at', { ascending: true });

      if (activeResult.error && isMissingColumnError(activeResult.error.message)) {
        const fallback = await client
          .from('module_entries')
          .select('id, data')
          .eq('module', module)
          .order('created_at', { ascending: true });

        if (fallback.error) throw new Error(`Supabase list error: ${fallback.error.message}`);
        rows = (fallback.data ?? []) as ModuleRow[];
      } else {
        if (activeResult.error) throw new Error(`Supabase list error: ${activeResult.error.message}`);
        rows = (activeResult.data ?? []) as ModuleRow[];
      }

      if (!context?.userId) {
        return rows.map((row) => stripInternalFields<T>(row));
      }

      // Ownership scoped entirely via __ownerId in the JSONB data column.
      // Any legacy user_id column is NOT used here because its FK to auth.users
      // is incompatible with NextAuth IDs.
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
      const tenantId = normalizeTenantId(context);
      const source = normalizeSource(context);

      const rpcRes = await client.rpc('buddhi_create_module_entry', {
        p_tenant_id: tenantId,
        p_module: module,
        p_owner_subject: context?.userId ?? null,
        p_scope: 'private',
        p_source: source,
        p_dedupe_key: null,
        p_tags: [],
        p_data: payload,
        p_actor_subject: context?.userId ?? null,
        p_event_type: 'created',
      });

      if (!rpcRes.error) {
        const row = (Array.isArray(rpcRes.data) ? rpcRes.data[0] : rpcRes.data) as RpcModuleRow;
        if (!row) throw new Error('Supabase create error: Empty RPC result');
        return stripInternalFields<T>(row);
      }

      if (!isMissingRpcFunctionError(rpcRes.error.message)) {
        throw new Error(`Supabase create error: ${rpcRes.error.message}`);
      }

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
      const tenantId = normalizeTenantId(context);

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

      const rpcRes = await client.rpc('buddhi_update_module_entry', {
        p_tenant_id: tenantId,
        p_module: module,
        p_entry_id: id,
        p_data: merged,
        p_actor_subject: context?.userId ?? null,
        p_event_type: 'updated',
      });

      if (!rpcRes.error) {
        const row = (Array.isArray(rpcRes.data) ? rpcRes.data[0] : rpcRes.data) as RpcModuleRow;
        if (!row) throw new Error('Supabase update error: Empty RPC result');
        return stripInternalFields<T>(row);
      }

      if (!isMissingRpcFunctionError(rpcRes.error.message)) {
        throw new Error(`Supabase update error: ${rpcRes.error.message}`);
      }

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
      const tenantId = normalizeTenantId(context);

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

      const rpcRes = await client.rpc('buddhi_soft_delete_module_entry', {
        p_tenant_id: tenantId,
        p_module: module,
        p_entry_id: id,
        p_actor_subject: context?.userId ?? null,
      });

      if (!rpcRes.error) {
        const base = Array.isArray(rpcRes.data) ? rpcRes.data[0] : rpcRes.data;
        const deleted =
          typeof base === 'boolean'
            ? base
            : (base as { buddhi_soft_delete_module_entry?: boolean } | null)
                ?.buddhi_soft_delete_module_entry;
        if (deleted === false) {
          throw new Error('Not found');
        }
        return;
      }

      if (!isMissingRpcFunctionError(rpcRes.error.message)) {
        throw new Error(`Supabase delete error: ${rpcRes.error.message}`);
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
