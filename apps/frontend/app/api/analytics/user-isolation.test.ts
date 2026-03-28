import { beforeEach, describe, expect, it, vi } from "vitest";

const authState = vi.hoisted(() => ({ currentUserId: "user-1" }));

type Row = {
  module: string;
  userId: string;
  data: Record<string, unknown>;
};

const db = vi.hoisted(() => ({ rows: [] as Row[] }));

const provider = vi.hoisted(() => ({
  async list(module: string, context?: { userId?: string }) {
    return db.rows
      .filter((r) => r.module === module && r.userId === context?.userId)
      .map((r, idx) => ({ id: `${module}-${idx + 1}`, ...r.data }));
  },
}));

vi.mock("@/app/auth/anonymous", () => ({
  ANONYMOUS_COOKIE_NAME: "buddhi-align-anonymous",
  isAnonymousCookie: () => false,
}));

vi.mock("@/auth", () => ({
  auth: vi.fn(async () => ({ user: { id: authState.currentUserId } })),
}));

vi.mock("@buddhi-align/data-access", () => ({
  createDataProvider: () => provider,
}));

vi.mock("../_anonymous-module-store", () => ({
  listAnonymousEntries: vi.fn(() => []),
}));

import { GET } from "./route";

function req() {
  return {
    cookies: { get: () => ({ value: "0" }) },
  } as never;
}

describe("analytics route user isolation", () => {
  beforeEach(() => {
    db.rows = [
      { module: "karma", userId: "user-1", data: { date: new Date().toISOString(), action: "serve" } },
      { module: "karma", userId: "user-1", data: { date: new Date().toISOString(), action: "teach" } },
      { module: "bhakti", userId: "user-2", data: { date: new Date().toISOString(), reflection: "gratitude" } },
    ];
    authState.currentUserId = "user-1";
  });

  it("returns only the authenticated user's aggregates", async () => {
    authState.currentUserId = "user-1";
    const u1Res = await GET(req());
    const u1 = await u1Res.json();

    authState.currentUserId = "user-2";
    const u2Res = await GET(req());
    const u2 = await u2Res.json();

    expect(u1.totalEntries).toBe(2);
    expect(u1.counts.karma).toBe(2);
    expect(u1.counts.bhakti).toBe(0);

    expect(u2.totalEntries).toBe(1);
    expect(u2.counts.karma).toBe(0);
    expect(u2.counts.bhakti).toBe(1);
  });
});
