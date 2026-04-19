/**
 * DataProvider — the single interface every storage backend must implement.
 *
 * Adding a new backend:
 *   1. Create a file (e.g. `my-backend.ts`) that returns / exports an object
 *      matching this interface.
 *   2. Register it in `factory.ts`.
 *   3. Set DATA_PROVIDER=my-backend in your environment.
 */

export type ModuleEntry = { id: string; [key: string]: unknown };

export interface DataAccessContext {
  userId?: string;
  tenantId?: string;
  source?: string;
}

export interface DataProvider {
  /** Return all entries for a module, ordered oldest-first. */
  list<T extends ModuleEntry>(module: string, context?: DataAccessContext): Promise<T[]>;

  /** Persist a new entry and return the saved record (with id populated). */
  create<T extends ModuleEntry>(
    module: string,
    data: Omit<T, 'id'>,
    context?: DataAccessContext,
  ): Promise<T>;

  /** Merge `data` into an existing entry and return the merged record. */
  update<T extends ModuleEntry>(
    module: string,
    id: string,
    data: Partial<Omit<T, 'id'>>,
    context?: DataAccessContext,
  ): Promise<T>;

  /** Remove an entry. Resolves silently if the entry does not exist. */
  delete(module: string, id: string, context?: DataAccessContext): Promise<void>;
}
