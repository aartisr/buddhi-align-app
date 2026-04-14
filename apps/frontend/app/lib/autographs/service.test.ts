import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  createDataProviderMock,
  reset,
} = vi.hoisted(() => {
  const rows: Record<string, Array<Record<string, unknown>>> = {
    autograph_profiles: [],
    autograph_requests: [],
  };

  const provider = {
    list: vi.fn(async (module: string) => rows[module] ?? []),
    create: vi.fn(async (module: string, payload: Record<string, unknown>) => {
      const entry = {
        id: `${module}-${(rows[module]?.length ?? 0) + 1}`,
        ...payload,
      };
      rows[module] = [...(rows[module] ?? []), entry];
      return entry;
    }),
    update: vi.fn(async (module: string, id: string, payload: Record<string, unknown>) => {
      const current = rows[module] ?? [];
      const target = current.find((item) => item.id === id);
      if (!target) {
        throw new Error("Not found");
      }
      const updated = { ...target, ...payload };
      rows[module] = current.map((item) => (item.id === id ? updated : item));
      return updated;
    }),
  };

  return {
    createDataProviderMock: vi.fn(() => provider),
    provider,
    reset() {
      rows.autograph_profiles = [];
      rows.autograph_requests = [];
      provider.list.mockClear();
      provider.create.mockClear();
      provider.update.mockClear();
    },
    rows,
  };
});

vi.mock("@buddhi-align/data-access", () => ({
  createDataProvider: createDataProviderMock,
}));

import {
  createAutographRequest,
  signAutographRequest,
  upsertAutographProfile,
} from "./service";

describe("autograph service", () => {
  beforeEach(() => {
    createDataProviderMock.mockClear();
    reset();
  });

  it("requires requester and signer to be different users", async () => {
    await upsertAutographProfile("user-1", {
      displayName: "User One",
      role: "student",
    });

    await expect(
      createAutographRequest("user-1", {
        signerUserId: "user-1",
        message: "Please sign",
      }),
    ).rejects.toThrow("You cannot request your own autograph");
  });

  it("allows only the targeted signer to sign", async () => {
    await upsertAutographProfile("user-1", {
      displayName: "User One",
      role: "student",
    });
    await upsertAutographProfile("user-2", {
      displayName: "User Two",
      role: "teacher",
    });

    const request = await createAutographRequest("user-1", {
      signerUserId: "user-2",
      message: "Your guidance inspires me",
    });

    await expect(
      signAutographRequest("user-3", request.id, {
        signatureText: "Blessings",
      }),
    ).rejects.toThrow("Only the requested signer can sign this autograph");

    const signed = await signAutographRequest("user-2", request.id, {
      signatureText: "Keep shining",
    });

    expect(signed.status).toBe("signed");
    expect(signed.signatureText).toBe("Keep shining");
  });
});
