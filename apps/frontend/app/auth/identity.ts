export function buildStableIdentityKey(provider?: string, providerAccountId?: string): string | null {
  if (!provider || !providerAccountId) {
    return null;
  }

  const normalizedProvider = provider.trim().toLowerCase();
  const normalizedAccountId = providerAccountId.trim();

  if (!normalizedProvider || !normalizedAccountId) {
    return null;
  }

  return `${normalizedProvider}:${normalizedAccountId}`;
}

export function resolveSessionSubject(tokenSub: unknown, identityKey: unknown): string | null {
  if (typeof identityKey === "string" && identityKey.trim()) {
    return identityKey;
  }

  if (typeof tokenSub === "string" && tokenSub.trim()) {
    return tokenSub;
  }

  return null;
}