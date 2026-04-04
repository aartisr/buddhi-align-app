type CacheEntry<T> = {
  data?: T;
  expiresAt: number;
  inFlight?: Promise<T>;
};

const fetchCache = new Map<string, CacheEntry<unknown>>();

interface CachedJsonFetchOptions {
  ttlMs?: number;
  forceRefresh?: boolean;
}

export async function cachedJsonFetch<T>(
  cacheKey: string,
  url: string,
  options?: CachedJsonFetchOptions,
): Promise<T> {
  const ttlMs = options?.ttlMs ?? 30_000;
  const forceRefresh = options?.forceRefresh ?? false;
  const now = Date.now();

  const existing = fetchCache.get(cacheKey) as CacheEntry<T> | undefined;
  if (!forceRefresh && existing?.data !== undefined && existing.expiresAt > now) {
    return existing.data;
  }

  if (!forceRefresh && existing?.inFlight) {
    return existing.inFlight;
  }

  const inFlight = fetch(url, { method: "GET" }).then(async (response) => {
    if (!response.ok) {
      throw new Error(`Request failed (${response.status}) for ${url}`);
    }

    const data = (await response.json()) as T;
    fetchCache.set(cacheKey, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
    return data;
  }).catch((error) => {
    const latest = fetchCache.get(cacheKey);
    if (latest) {
      latest.inFlight = undefined;
      fetchCache.set(cacheKey, latest);
    }
    throw error;
  });

  fetchCache.set(cacheKey, {
    data: existing?.data,
    expiresAt: existing?.expiresAt ?? 0,
    inFlight,
  });

  return inFlight;
}

export function invalidateClientFetchCache(cacheKey: string): void {
  fetchCache.delete(cacheKey);
}