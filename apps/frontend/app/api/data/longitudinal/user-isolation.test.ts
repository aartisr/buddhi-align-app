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

vi.mock("../../_anonymous-module-store", () => ({
  listAnonymousEntries: vi.fn(() => []),
}));

import { GET } from "./route";

function req() {
  return {
    cookies: { get: () => ({ value: "0" }) },
  } as never;
}

describe("longitudinal route user isolation", () => {
  beforeEach(() => {
    db.rows = [
      { module: "karma", userId: "user-1", data: { date: new Date().toISOString(), action: "serve" } },
      { module: "jnana", userId: "user-1", data: { date: new Date().toISOString(), insight: "clarity" } },
      { module: "bhakti", userId: "user-2", data: { date: new Date().toISOString(), reflection: "gratitude" } },
    ];
    authState.currentUserId = "user-1";
  });

  it("returns trend buckets computed from only the authenticated user's entries", async () => {
    authState.currentUserId = "user-1";
    const u1Res = await GET(req());
    const u1 = await u1Res.json();

    authState.currentUserId = "user-2";
    const u2Res = await GET(req());
    const u2 = await u2Res.json();

    const u1Total = u1.weeks.reduce((sum: number, w: { total: number }) => sum + w.total, 0);
    const u2Total = u2.weeks.reduce((sum: number, w: { total: number }) => sum + w.total, 0);

    expect(u1Total).toBe(2);
    expect(u2Total).toBe(1);
  });
});
