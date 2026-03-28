/**
 * InMemoryDataProvider
 *
 * Stores data in process memory.
 * Useful for local development and unit tests — no external services required.
 * Data is lost on server restart.
 *
 * Activate: DATA_PROVIDER=memory
 */

import type { DataProvider, ModuleEntry } from './provider';

/** Module-keyed map of id → entry */
const store = new Map<string, Map<string, ModuleEntry>>();
let counter = 0;

export class InMemoryDataProvider implements DataProvider {
  private bucket(module: string): Map<string, ModuleEntry> {
    if (!store.has(module)) store.set(module, new Map());
    return store.get(module)!;
  }

  async list<T extends ModuleEntry>(module: string): Promise<T[]> {
    return Array.from(this.bucket(module).values()) as T[];
  }

  async create<T extends ModuleEntry>(
    module: string,
    data: Omit<T, 'id'>,
  ): Promise<T> {
    const id = String(++counter);
    const entry = { ...data, id } as T;
    this.bucket(module).set(id, entry);
    return entry;
  }

  async update<T extends ModuleEntry>(
    module: string,
    id: string,
    data: Partial<Omit<T, 'id'>>,
  ): Promise<T> {
    const bucket = this.bucket(module);
    const existing = bucket.get(id);
    if (!existing) {
      throw new Error(`Entry ${id} not found in module "${module}"`);
    }
    const updated = { ...existing, ...data } as T;
    bucket.set(id, updated);
    return updated;
  }

  async delete(module: string, id: string): Promise<void> {
    this.bucket(module).delete(id);
  }
}

/** Reset all stored data — useful between tests. */
export function clearInMemoryStore(): void {
  store.clear();
  counter = 0;
}
