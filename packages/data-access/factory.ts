/**
 * createDataProvider — factory that selects a DataProvider implementation
 * based on the DATA_PROVIDER environment variable.
 *
 * Supported values:
 *   supabase  (default) — SupabaseDataProvider (requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)
 *   memory              — InMemoryDataProvider (no external services, data lost on restart)
 *
 * The singleton is cached for the lifetime of the Node.js process / serverless
 * warm instance.  Call resetDataProvider() between test cases to start fresh.
 */

import { InMemoryDataProvider } from './in-memory';
import { createSupabaseDataProvider } from './supabase';
import type { DataProvider } from './provider';

let _instance: DataProvider | null = null;

export function createDataProvider(): DataProvider {
  if (_instance) return _instance;

  const providerType = (process.env.DATA_PROVIDER ?? 'supabase').toLowerCase();

  switch (providerType) {
    case 'memory':
      _instance = new InMemoryDataProvider();
      break;

    case 'supabase':
      _instance = createSupabaseDataProvider();
      break;

    default:
      throw new Error(
        `Unknown DATA_PROVIDER: "${providerType}". ` +
          'Valid options: supabase, memory',
      );
  }

  return _instance;
}

/** Reset cached singleton — call this between test cases or after env changes. */
export function resetDataProvider(): void {
  _instance = null;
}
