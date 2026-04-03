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

const OWNER_ID_KEY = '__ownerId';

type ModuleRow = {
  id: string;
  data: Record<string, unknown>;
};

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isMissingUserIdColumnError(error: { message: string } | null): boolean {
  if (!error) return false;
  const msg = error.message.toLowerCase();
  return msg.includes('user_id') && (msg.includes('column') || msg.includes('schema cache'));
}

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
  });

  async function listByUserIdColumn(
    module: string,
    context?: DataAccessContext,
  ): Promise<ModuleRow[]> {
    if (!context?.userId || !isUuid(context.userId)) return [];

    const { data, error } = await client
      .from('module_entries')
      .select('id, data')
      .eq('module', module)
      .eq('user_id', context.userId)
      .order('created_at', { ascending: true });

    if (error) {
      if (isMissingUserIdColumnError(error)) return [];
      throw new Error(`Supabase list error: ${error.message}`);
    }

    return (data ?? []) as ModuleRow[];
  }

  async function isOwnedByUserIdColumn(
    module: string,
    id: string,
    context?: DataAccessContext,
  ): Promise<boolean> {
    if (!context?.userId || !isUuid(context.userId)) return false;

    const { data, error } = await client
      .from('module_entries')
      .select('id')
      .eq('module', module)
      .eq('id', id)
      .eq('user_id', context.userId)
      .maybeSingle();

    if (error) {
      if (isMissingUserIdColumnError(error)) return false;
      throw new Error(`Supabase ownership check error: ${error.message}`);
    }

    return Boolean(data?.id);
  }

  async function insertWithOptionalUserIdColumn(
    module: string,
    data: Record<string, unknown>,
    context?: DataAccessContext,
  ): Promise<ModuleRow> {
    const payload: Record<string, unknown> = {
      module,
      data,
    };

    if (context?.userId && isUuid(context.userId)) {
      payload.user_id = context.userId;
    }

    const insertQuery = client
      .from('module_entries')
      .insert(payload)
      .select('id, data')
      .single();

    const { data: inserted, error } = await insertQuery;

    if (!error) {
      return inserted as ModuleRow;
    }

    if (!('user_id' in payload) || !isMissingUserIdColumnError(error)) {
      throw new Error(`Supabase create error: ${error.message}`);
    }

    const { data: fallbackInserted, error: fallbackError } = await client
      .from('module_entries')
      .insert({ module, data })
      .select('id, data')
      .single();

    if (fallbackError) {
      throw new Error(`Supabase create error: ${fallbackError.message}`);
    }

    return fallbackInserted as ModuleRow;
  }

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

      const ownerScopedRows = rows.filter((row) => extractOwnerId(row.data) === context.userId);
      const userIdScopedRows = await listByUserIdColumn(module, context);

      const mergedById = new Map<string, ModuleRow>();
      for (const row of ownerScopedRows) mergedById.set(row.id, row);
      for (const row of userIdScopedRows) mergedById.set(row.id, row);

      return Array.from(mergedById.values()).map((row) => stripInternalFields<T>(row));
    },

    async create<T extends ModuleEntry>(
      module: string,
      entryData: Omit<T, 'id'>,
      context?: DataAccessContext,
    ): Promise<T> {
      const payload = withOwnerId(entryData as Record<string, unknown>, context);
      const created = await insertWithOptionalUserIdColumn(module, payload, context);
      return stripInternalFields<T>(created);
    },

    async update<T extends ModuleEntry>(
      module: string,
      id: string,
      entryData: Partial<Omit<T, 'id'>>,
      context?: DataAccessContext,
    ): Promise<T> {
      // Fetch current payload, verify ownership, then merge and persist.
      const { data: current, error: fetchErr } = await client
        .from('module_entries')
        .select('id, data')
        .eq('id', id)
        .eq('module', module)
        .single();

      if (fetchErr) {
        throw new Error(
          `Supabase update (fetch) error: ${fetchErr.message}`,
        );
      }

      const currentRow = current as ModuleRow;
      if (context?.userId) {
        const ownerMatchesData = extractOwnerId(currentRow.data) === context.userId;
        const ownerMatchesColumn = await isOwnedByUserIdColumn(module, id, context);
        if (!ownerMatchesData && !ownerMatchesColumn) {
          throw new Error('Not found');
        }
      }

      const merged = withOwnerId(
        {
          ...currentRow.data,
          ...(entryData as object),
        } as Record<string, unknown>,
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
          .single();

        if (fetchErr) {
          throw new Error(`Supabase delete (fetch) error: ${fetchErr.message}`);
        }

        const currentRow = current as ModuleRow;
        const ownerMatchesData = extractOwnerId(currentRow.data) === context.userId;
        const ownerMatchesColumn = await isOwnedByUserIdColumn(module, id, context);
        if (!ownerMatchesData && !ownerMatchesColumn) {
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
