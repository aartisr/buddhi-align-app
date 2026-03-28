import { beforeEach, describe, expect, it, vi } from "vitest";

const authState = vi.hoisted(() => ({ currentUserId: "user-1" }));

interface StoredEntry {
  id: string;
  module: string;
  userId: string;
  data: Record<string, unknown>;
}

const db = vi.hoisted(() => ({
  rows: [] as StoredEntry[],
  idCounter: 0,
}));

const provider = vi.hoisted(() => ({
  async list(module: string, context?: { userId?: string }) {
    const userId = context?.userId;
    return db.rows
      .filter((row) => row.module === module && row.userId === userId)
      .map((row) => ({ id: row.id, ...row.data }));
  },

  async create(module: string, data: Record<string, unknown>, context?: { userId?: string }) {
    const userId = context?.userId ?? "";
    const id = String(++db.idCounter);
    db.rows.push({ id, module, userId, data: { ...data } });
    return { id, ...data };
  },

  async update(module: string, id: string, patch: Record<string, unknown>, context?: { userId?: string }) {
    const userId = context?.userId;
    const row = db.rows.find((r) => r.module === module && r.id === id && r.userId === userId);
    if (!row) throw new Error("Not found");
    row.data = { ...row.data, ...patch };
    return { id: row.id, ...row.data };
  },

  async delete(module: string, id: string, context?: { userId?: string }) {
    const userId = context?.userId;
    const idx = db.rows.findIndex((r) => r.module === module && r.id === id && r.userId === userId);
    if (idx >= 0) db.rows.splice(idx, 1);
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

import { GET as moduleGET, POST as modulePOST } from "./route";
import { DELETE as idDELETE, PUT as idPUT } from "./[id]/route";

function req(body?: unknown) {
  return {
    cookies: { get: () => ({ value: "0" }) },
    json: async () => body,
  } as never;
}

describe("API user isolation", () => {
  beforeEach(() => {
    db.rows = [];
    db.idCounter = 0;
    authState.currentUserId = "user-1";
  });

  it("isolates create/list across two users", async () => {
    authState.currentUserId = "user-1";
    const c1 = await modulePOST(req({ date: "2026-03-28", action: "serve" }), {
      params: { module: "karma" },
    });
    expect(c1.status).toBe(201);

    authState.currentUserId = "user-2";
    const c2 = await modulePOST(req({ date: "2026-03-28", action: "meditate" }), {
      params: { module: "karma" },
    });
    expect(c2.status).toBe(201);

    authState.currentUserId = "user-1";
    const g1 = await moduleGET(req(), { params: { module: "karma" } });
    const data1 = await g1.json();

    authState.currentUserId = "user-2";
    const g2 = await moduleGET(req(), { params: { module: "karma" } });
    const data2 = await g2.json();

    expect(data1).toHaveLength(1);
    expect(data2).toHaveLength(1);
    expect(data1[0].action).toBe("serve");
    expect(data2[0].action).toBe("meditate");
  });

  it("prevents cross-user update/delete side effects", async () => {
    authState.currentUserId = "user-1";
    const createRes = await modulePOST(req({ date: "2026-03-28", action: "reflect" }), {
      params: { module: "karma" },
    });
    const created = await createRes.json();

    authState.currentUserId = "user-2";
    const deleteRes = await idDELETE(req(), {
      params: { module: "karma", id: created.id },
    });
    expect(deleteRes.status).toBe(204);

    authState.currentUserId = "user-1";
    const afterDelete = await moduleGET(req(), { params: { module: "karma" } });
    const ownRows = await afterDelete.json();
    expect(ownRows).toHaveLength(1);
    expect(ownRows[0].id).toBe(created.id);

    authState.currentUserId = "user-2";
    const updateRes = await idPUT(req({ action: "tamper" }), {
      params: { module: "karma", id: created.id },
    });
    expect(updateRes.status).toBe(404);

    authState.currentUserId = "user-1";
    const finalGet = await moduleGET(req(), { params: { module: "karma" } });
    const finalRows = await finalGet.json();
    expect(finalRows[0].action).toBe("reflect");
  });
});
