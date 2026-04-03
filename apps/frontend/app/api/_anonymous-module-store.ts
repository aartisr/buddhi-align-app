type ModuleEntry = Record<string, unknown> & { id: string };

type ModuleStore = Record<string, ModuleEntry[]>;

/** Maximum entries kept per module in the in-memory anonymous store. */
const MAX_ENTRIES_PER_MODULE = 500;

declare global {
  var __buddhiAnonymousModuleStore: ModuleStore | undefined;
}

function getStore(): ModuleStore {
  if (!globalThis.__buddhiAnonymousModuleStore) {
    globalThis.__buddhiAnonymousModuleStore = {};
  }
  return globalThis.__buddhiAnonymousModuleStore;
}

function getModuleEntries(module: string): ModuleEntry[] {
  const store = getStore();
  if (!store[module]) {
    store[module] = [];
  }
  return store[module];
}

export function listAnonymousEntries(module: string): ModuleEntry[] {
  return [...getModuleEntries(module)];
}

export function createAnonymousEntry(module: string, body: Record<string, unknown>): ModuleEntry {
  const entry: ModuleEntry = {
    id: crypto.randomUUID(),
    ...body,
  };
  const entries = getModuleEntries(module);
  // Evict oldest entries if the store grows too large to prevent memory leaks.
  if (entries.length >= MAX_ENTRIES_PER_MODULE) {
    entries.splice(0, entries.length - MAX_ENTRIES_PER_MODULE + 1);
  }
  entries.push(entry);
  return entry;
}

export function updateAnonymousEntry(
  module: string,
  id: string,
  body: Record<string, unknown>,
): ModuleEntry {
  const entries = getModuleEntries(module);
  const index = entries.findIndex((entry) => entry.id === id);

  if (index === -1) {
    throw new Error("Not found");
  }

  const updated: ModuleEntry = {
    ...entries[index],
    ...body,
    id,
  };

  entries[index] = updated;
  return updated;
}

export function deleteAnonymousEntry(module: string, id: string): void {
  const entries = getModuleEntries(module);
  const index = entries.findIndex((entry) => entry.id === id);

  if (index === -1) {
    throw new Error("Not found");
  }

  entries.splice(index, 1);
}
