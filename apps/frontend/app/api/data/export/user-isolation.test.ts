import { beforeEach, describe, expect, it, vi } from "vitest";

const authState = vi.hoisted(() => ({ currentUserId: "user-1" }));

type StoredEntry = {
  id: string;
  module: string;
  userId?: string;
  data: Record<string, unknown>;
};

const db = vi.hoisted(() => ({
  rows: [] as StoredEntry[],
  idCounter: 0,
}));

const provider = vi.hoisted(() => ({
  async list(module: string, context?: { userId?: string }) {
    return db.rows
      .filter((row) => row.module === module && row.userId === context?.userId)
      .map((row) => ({ id: row.id, ...row.data }));
  },

  async create(module: string, data: Record<string, unknown>, context?: { userId?: string }) {
    const id = String(++db.idCounter);
    db.rows.push({
      id,
      module,
      userId: context?.userId,
      data: { ...data },
    });
    return { id, ...data };
  },

  async update() {
    throw new Error("not implemented");
  },

  async delete() {
    throw new Error("not implemented");
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

import { GET, POST } from "./route";

function req(body?: unknown) {
  return {
    cookies: { get: () => ({ value: "0" }) },
    json: async () => body,
  } as never;
}

describe("/api/data/export user isolation", () => {
  beforeEach(() => {
    db.rows = [];
    db.idCounter = 0;
    authState.currentUserId = "user-1";
  });

  it("keeps imports and exports isolated per authenticated user", async () => {
    authState.currentUserId = "user-1";
    const user1Import = {
      version: 1,
      exportedAt: "2026-03-28T00:00:00.000Z",
      modules: {
        karma: [{ id: "old-a", date: "2026-03-28", action: "serve" }],
      },
    };
    const post1 = await POST(req(user1Import));
    expect(post1.status).toBe(200);

    authState.currentUserId = "user-2";
    const user2Import = {
      version: 1,
      exportedAt: "2026-03-28T00:00:00.000Z",
      modules: {
        bhakti: [{ id: "old-b", date: "2026-03-28", reflection: "gratitude" }],
      },
    };
    const post2 = await POST(req(user2Import));
    expect(post2.status).toBe(200);

    authState.currentUserId = "user-1";
    const get1 = await GET(req());
    const payload1 = JSON.parse(await get1.text()) as {
      modules: Record<string, Array<Record<string, unknown>>>;
    };

    authState.currentUserId = "user-2";
    const get2 = await GET(req());
    const payload2 = JSON.parse(await get2.text()) as {
      modules: Record<string, Array<Record<string, unknown>>>;
    };

    expect(payload1.modules.karma).toHaveLength(1);
    expect(payload1.modules.karma[0].action).toBe("serve");
    expect(payload1.modules.bhakti).toHaveLength(0);

    expect(payload2.modules.karma).toHaveLength(0);
    expect(payload2.modules.bhakti).toHaveLength(1);
    expect(payload2.modules.bhakti[0].reflection).toBe("gratitude");
  });
});
