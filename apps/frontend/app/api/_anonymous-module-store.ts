type ModuleEntry = Record<string, unknown> & { id: string };

type ModuleStore = Record<string, ModuleEntry[]>;

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
